import {createClient} from '@/lib/supabase/server';

export async function resetUserPassword(email: string) {
  const supabase = await createClient();
  const {error} = await supabase.auth.resetPasswordForEmail(email);

  // Sends email just to existing users, otherwise sends nothing,
  // but returns a success message
  return {error};
}
