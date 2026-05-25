import {type EmailOtpType} from '@supabase/supabase-js';
import {redirect} from 'next/navigation';
import {type NextRequest} from 'next/server';

import {createClient} from '@/lib/supabase/server';

function isEmailOtpType(value: string | null): value is EmailOtpType {
  if (!value) return false;
  return (
    value === 'signup' ||
    value === 'invite' ||
    value === 'magiclink' ||
    value === 'recovery' ||
    value === 'email_change' ||
    value === 'phone_change'
  );
}

function getSafeNextPath(nextParam: string | null): string {
  if (!nextParam) return '/';
  const next = nextParam.trim();
  // Only allow app-internal absolute paths. Prevent open redirect via "//" or scheme.
  if (!next.startsWith('/')) return '/';
  if (next.startsWith('//')) return '/';
  if (next.includes('://')) return '/';
  return next;
}

function errorRedirect(request: NextRequest, _message: string): never {
  // todo
  const url = new URL(request.url);
  url.pathname = '/error';
  // url.search = '';
  // url.searchParams.set('error', message);
  redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const type = isEmailOtpType(typeParam) ? typeParam : null;
  const next = getSafeNextPath(searchParams.get('next'));

  if (token_hash && type) {
    const supabase = await createClient();
    const {error} = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      redirect(next);
    }
  }
  errorRedirect(
    request,
    'Odkaz pro nastavení nového hesla není platný nebo vypršel. Zkuste to znovu.',
  );
}
