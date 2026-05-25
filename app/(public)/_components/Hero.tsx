import {getWebItemByKey} from '@/lib/server/getWebItem';
import {resolvePublicImageUrl} from '@/lib/utils/resolvePublicImageUrl';

import classes from './Hero.module.css';

/** Full-bleed homepage hero using the current season banner image. */
export async function Hero() {
  const logoItem = await getWebItemByKey('logo');
  const heroImageUrl = resolvePublicImageUrl(logoItem?.banner);

  if (!heroImageUrl) return null;

  return (
    <section
      id="hero"
      className={classes.hero}
      style={{backgroundImage: `url("${heroImageUrl}")`}}
    />
  );
}
