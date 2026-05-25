import '@mantine/notifications/styles.css';

import {Notifications} from '@mantine/notifications';
import {redirect} from 'next/navigation';

import {LogoImageProvider} from '@/components/ui/LogoImageProvider';
import {getLogoImageUrls} from '@/lib/server/getLogoImageUrl';
import {getUser} from '@/lib/server/getUser';

import {AdminShell} from './_components/AdminShell';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {user, error} = await getUser();
  const logoImageUrls = await getLogoImageUrls();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <LogoImageProvider value={logoImageUrls}>
      <AdminShell>
        <Notifications position="top-center" />
        {children}
      </AdminShell>
    </LogoImageProvider>
  );
}
