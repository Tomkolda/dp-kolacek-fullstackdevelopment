import {revalidatePath} from 'next/cache';

import {createClient} from '@/lib/supabase/server';

type CreateActionSuccess = {success: true};
type CreateActionFailure = {success: false; error: string};

export type CreateActionResult = CreateActionSuccess | CreateActionFailure;

type ConstraintErrorRule = {
  // Substring expected in DB error message (e.g. constraint name).
  includes: string;
  // User-facing validation-style message returned to UI.
  message: string;
};

type RunCreateRecordActionOptions<TInput> = {
  // Used in logs to identify which action failed.
  actionName: string;
  input: TInput;
  // Fallback message returned when no specific rule matches.
  genericErrorMessage: string;
  // Optional domain validation before auth/db work.
  validate?: (input: TInput) => string | null;
  // Entity-specific insert logic (table + value mapping).
  executeInsert: (context: {input: TInput; userId: string}) => Promise<void>;
  // Paths to revalidate after successful insert.
  revalidatePaths?: string[];
  // Maps known DB constraint failures to user-friendly messages.
  constraintErrors?: ConstraintErrorRule[];
  unauthenticatedErrorMessage?: string;
};

function asErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export async function runCreateRecordAction<TInput>({
  actionName,
  input,
  genericErrorMessage,
  validate,
  executeInsert,
  revalidatePaths = [],
  constraintErrors = [],
  unauthenticatedErrorMessage = 'Nepřihlášený uživatel.',
}: RunCreateRecordActionOptions<TInput>): Promise<CreateActionResult> {
  // Fast fail on domain validation errors.
  const validationError = validate?.(input) ?? null;
  if (validationError) {
    return {success: false, error: validationError};
  }

  // Enforce authenticated admin action and capture author id.
  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) {
    return {success: false, error: unauthenticatedErrorMessage};
  }

  try {
    // Entity-specific persistence work.
    await executeInsert({input, userId: data.user.id});

    // Keep admin/public pages in sync with latest write.
    for (const path of revalidatePaths) {
      revalidatePath(path);
    }

    return {success: true};
  } catch (error: unknown) {
    // Convert known DB constraint errors to deterministic UI messages.
    const errorMessage = asErrorMessage(error);
    const matchedRule = constraintErrors.find((rule) =>
      errorMessage.includes(rule.includes),
    );
    if (matchedRule) {
      return {success: false, error: matchedRule.message};
    }

    // eslint-disable-next-line no-console
    console.error(`[${actionName}] Failed:`, error);
    return {success: false, error: genericErrorMessage};
  }
}
