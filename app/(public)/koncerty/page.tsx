import type {Metadata} from 'next';

import {AllGigs} from './_components/AllGigs';

export const metadata: Metadata = {
  title: 'Koncerty',
  description: 'Přehled všech nadcházejících koncertů kapely Free Fall',
  openGraph: {
    title: 'Free Fall - Koncerty',
    description: 'Přehled všech nadcházejících koncertů kapely Free Fall',
  },
};

/** Page displaying all upcoming gigs. */
export default function GigsPage() {
  return <AllGigs />;
}
