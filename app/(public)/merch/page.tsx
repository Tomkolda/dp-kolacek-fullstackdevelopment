import type {Metadata} from 'next';

import {AllMerchProducts} from './_components/AllMerchProducts';

export const metadata: Metadata = {
  title: 'Merch',
  description:
    'Merchandise kapely Free Fall — CD, trička, mikiny a další doplňky.',
  openGraph: {
    title: 'Free Fall — Merch',
    description:
      'Merchandise kapely Free Fall — CD, trička, mikiny a další doplňky.',
  },
};

export default function MerchPage() {
  return <AllMerchProducts />;
}
