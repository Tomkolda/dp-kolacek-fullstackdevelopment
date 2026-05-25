export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && supabasePublishableKey,
);
