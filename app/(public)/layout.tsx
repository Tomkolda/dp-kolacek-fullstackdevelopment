import {Container} from '@mantine/core';

import {LogoImageProvider} from '@/components/ui/LogoImageProvider';
import {getLogoImageUrls} from '@/lib/server/getLogoImageUrl';
import {getUser} from '@/lib/server/getUser';

import {Footer} from './_components/Footer';
import {Header} from './_components/Header';
import classes from './public.module.css';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {user} = await getUser();
  const logoImageUrls = await getLogoImageUrls();

  return (
    <LogoImageProvider value={logoImageUrls}>
      <Header showAdmin={!!user} />
      <Container className={classes.app}>{children}</Container>
      <Footer />
    </LogoImageProvider>
  );
}
