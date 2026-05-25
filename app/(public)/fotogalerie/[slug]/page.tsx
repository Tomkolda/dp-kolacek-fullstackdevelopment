import type {Metadata} from 'next';

import {getGalleryMetaBySlug} from '@/lib/server/getGalleries';
import {formatDate} from '@/lib/utils/datetime';

import {AllGalleries} from '../_components/AllGalleries';

type Props = {
  params: Promise<{slug: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;
  const gallery = await getGalleryMetaBySlug(slug);
  if (!gallery) return {title: 'Fotogalerie'};

  const formattedDate = formatDate(gallery.date, 'd. M. yyyy');
  const displayTitle = formattedDate
    ? `${formattedDate} – ${gallery.title}`
    : gallery.title;

  return {
    title: displayTitle,
    openGraph: {title: `Free Fall - ${displayTitle}`},
  };
}

export default async function GallerySlugPage({params}: Props) {
  const {slug} = await params;
  return <AllGalleries openSlug={slug} />;
}
