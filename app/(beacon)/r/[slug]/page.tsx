import type {Metadata} from 'next';
import {notFound} from 'next/navigation';

import {getBeaconBySlug} from '@/lib/server/getBeacon';

import {BeaconPage} from './_components/BeaconPage';

type Props = {
  params: Promise<{slug: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;
  const beacon = await getBeaconBySlug(slug);

  if (!beacon) {
    return {title: 'Beacon nenalezen'};
  }

  const description = beacon.description ?? beacon.title;

  return {
    title: beacon.title,
    description,
    openGraph: {
      title: beacon.title,
      description,
      type: 'music.album',
      ...(beacon.imageUrl ? {images: [{url: beacon.imageUrl}]} : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: beacon.title,
      description,
      ...(beacon.imageUrl ? {images: [beacon.imageUrl]} : {}),
    },
  };
}

export default async function BeaconSlugPage({params}: Props) {
  const {slug} = await params;
  const beacon = await getBeaconBySlug(slug);

  if (!beacon) {
    notFound();
  }

  return <BeaconPage beacon={beacon} />;
}
