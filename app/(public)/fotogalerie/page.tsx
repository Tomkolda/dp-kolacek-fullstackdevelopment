import type {Metadata} from 'next';

import {AllGalleries} from './_components/AllGalleries';

export const metadata: Metadata = {
  title: 'Fotogalerie',
  description: 'Přehled fotoalb kapely Free Fall',
  openGraph: {
    title: 'Free Fall - Fotogalerie',
    description: 'Přehled fotoalb kapely Free Fall',
  },
};

/** Page displaying published photo galleries. */
export default function PhotoGalleryPage() {
  return <AllGalleries />;
}
