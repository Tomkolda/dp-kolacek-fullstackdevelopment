import type {Metadata} from 'next';

import {AllAlbums} from './_components/AllAlbums';

export const metadata: Metadata = {
  title: 'Diskografie',
  description: 'Přehled vydaných alb kapely Free Fall',
  openGraph: {
    title: 'Free Fall - Diskografie',
    description: 'Přehled vydaných alb kapely Free Fall',
  },
};

/** Page displaying published albums in the discography. */
export default function DiscographyPage() {
  return <AllAlbums />;
}
