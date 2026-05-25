'use server';

import {createClient as createAdminClient} from '@supabase/supabase-js';

import {createClient} from '@/lib/supabase/server';

/**
 * Resolves a Supabase auth user ID to a display name (full_name or email).
 * Intended for audit info like createdBy / updatedBy fields.
 * Requires authenticated caller.
 */
export async function getUserNameById(
  userId: string | null | undefined,
): Promise<string | null> {
  if (!userId) return null;

  const supabase = await createClient();
  const {error: authError} = await supabase.auth.getUser();
  if (authError) return null;

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const {data, error} = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data.user) return null;

    const fullName: unknown = data.user.user_metadata?.full_name;
    return (
      (typeof fullName === 'string' ? fullName : null) ||
      data.user.email ||
      null
    );
  } catch {
    return null;
  }
}
