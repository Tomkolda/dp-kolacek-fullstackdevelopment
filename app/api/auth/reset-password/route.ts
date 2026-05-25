import {NextResponse} from 'next/server';

import {resetUserPassword} from '@/lib/server/resetUserPassword';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({error: 'Invalid request body'}, {status: 400});
    }

    const email = (body as {email?: unknown}).email;
    if (typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json({error: 'Missing email'}, {status: 400});
    }

    const {error} = await resetUserPassword(email.trim());
    if (error) {
      return NextResponse.json({error: error.message}, {status: 400});
    }

    return NextResponse.json({ok: true});
  } catch {
    return NextResponse.json({error: 'Unexpected error'}, {status: 500});
  }
}
