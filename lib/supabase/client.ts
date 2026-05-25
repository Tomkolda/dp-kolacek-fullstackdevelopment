import {createBrowserClient} from '@supabase/ssr';

import {supabasePublishableKey} from '@/lib/utils/utils';

type CreateBrowserSupabaseClientOptions = {
  /**
   * Kde uložit auth session.
   * - `local`: přetrvá i po zavření prohlížeče (remember me)
   * - `session`: zanikne po zavření prohlížeče
   */
  storage?: 'local' | 'session';
};

export function createClient(options?: CreateBrowserSupabaseClientOptions) {
  const auth =
    typeof window === 'undefined'
      ? {persistSession: true}
      : {
          persistSession: true,
          storage:
            options?.storage === 'session'
              ? window.sessionStorage
              : window.localStorage,
        };

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey!,
    {auth},
  );
}
