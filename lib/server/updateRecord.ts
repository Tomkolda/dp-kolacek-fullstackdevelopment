import {revalidatePath} from 'next/cache';

import {createClient} from '@/lib/supabase/server';

type UpdateActionSuccess = {success: true};
type UpdateActionFailure = {success: false; error: string};

export type UpdateActionResult = UpdateActionSuccess | UpdateActionFailure;

type ConstraintErrorRule = {
  includes: string;
  message: string;
};

type RunUpdateRecordActionOptions<TInput> = {
  actionName: string;
  id: number;
  input: TInput;
  genericErrorMessage: string;
  notFoundErrorMessage?: string;
  validate?: (input: TInput) => string | null;
  executeUpdate: (context: {
    id: number;
    input: TInput;
    userId: string;
  }) => Promise<number>;
  revalidatePaths?: string[];
  constraintErrors?: ConstraintErrorRule[];
  unauthenticatedErrorMessage?: string;
};

function asErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export async function runUpdateRecordAction<TInput>({
  actionName,
  id,
  input,
  genericErrorMessage,
  notFoundErrorMessage = 'Záznam nebyl nalezen.',
  validate,
  executeUpdate,
  revalidatePaths = [],
  constraintErrors = [],
  unauthenticatedErrorMessage = 'Nepřihlášený uživatel.',
}: RunUpdateRecordActionOptions<TInput>): Promise<UpdateActionResult> {
  const validationError = validate?.(input) ?? null;
  if (validationError) {
    return {success: false, error: validationError};
  }

  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) {
    return {success: false, error: unauthenticatedErrorMessage};
  }

  try {
    const affectedRows = await executeUpdate({
      id,
      input,
      userId: data.user.id,
    });

    if (affectedRows === 0) {
      return {success: false, error: notFoundErrorMessage};
    }

    for (const path of revalidatePaths) {
      revalidatePath(path);
    }

    return {success: true};
  } catch (error: unknown) {
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
