import {getWebItemByKey} from '@/lib/server/getWebItem';
import {resolvePublicImageUrl} from '@/lib/utils/resolvePublicImageUrl';

export type LogoImageUrls = {
  light: string | null;
  dark: string | null;
};

export async function getLogoImageUrls(): Promise<LogoImageUrls> {
  const logoItem = await getWebItemByKey('logo');

  return {
    light: resolvePublicImageUrl(logoItem?.combined ?? null),
    dark: resolvePublicImageUrl(logoItem?.combinedDark ?? null),
  };
}
