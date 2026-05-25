import {LogoImageProvider} from '@/components/ui/LogoImageProvider';
import {getLogoImageUrls} from '@/lib/server/getLogoImageUrl';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoImageUrls = await getLogoImageUrls();

  return (
    <LogoImageProvider value={logoImageUrls}>{children}</LogoImageProvider>
  );
}
