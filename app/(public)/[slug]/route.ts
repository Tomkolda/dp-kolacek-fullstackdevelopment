import {redirect} from 'next/navigation';
import {type NextRequest, NextResponse} from 'next/server';

import {getRedirectUrl} from '@/lib/server/getRedirectUrl';

export async function GET(
  _request: NextRequest,
  context: {params: Promise<{slug: string}>},
) {
  const {slug} = await context.params;
  const target = await getRedirectUrl(slug);

  // console.log('slug', slug);
  if (!target) {
    // todo: default error page 404
    return redirect('/error');
  }

  try {
    const targetUrl = new URL(target);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return new NextResponse('Invalid protocol', {status: 400});
    }
  } catch {
    return new NextResponse('Invalid URL', {status: 400});
  }
  return NextResponse.redirect(target, 301);
}
