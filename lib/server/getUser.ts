import {cache} from 'react';

import {createClient} from '@/lib/supabase/server';

/**
 * Memoizuje načtení usera v rámci jednoho server requestu (RSC).
 * Díky tomu můžeš volat `getUser()` z více server komponent bez
 * opakovaných requestů na Supabase.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {data, error} = await supabase.auth.getUser();
  return {user: data.user, error};
});
