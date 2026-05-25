import {redirect} from 'next/navigation';

import {getUser} from '@/lib/server/getUser';

import {UserProfileForm} from './_components/UserProfileForm';

export default async function Page() {
  const {user} = await getUser();
  if (!user) redirect('/auth/login');

  return (
    <UserProfileForm
      userId={user.id}
      email={user.email ?? null}
      createdAt={user.created_at ?? null}
      lastSignInAt={user.last_sign_in_at ?? null}
      initialFullName={
        (user.user_metadata?.full_name as string | undefined) ?? null
      }
    />
  );
}
