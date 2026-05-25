import type {Metadata} from 'next';

import {AboutUs} from './_components/AboutUs';
import {FbNews} from './_components/FbNews';
import {Gigs} from './_components/Gigs';
import {Hero} from './_components/Hero';
import {Lineup} from './_components/Lineup';
import {Platforms} from './_components/Platforms';
import {Sponsors} from './_components/Sponsors';
import {Stats} from './_components/Stats';
import {Videoclip} from './_components/Videoclip';

// todo (fre-57): create a valid metadata
export const metadata: Metadata = {
  title: 'Domů',
  description: 'Oficiální web metalové kapely Free Fall z Uherského Hradiště',
  openGraph: {
    title: 'Free Fall - Domů',
    description: 'Oficiální web metalové kapely Free Fall z Uherského Hradiště',
  },
};

/** Landing page composing all public homepage sections. */
export default function HomePage() {
  return (
    <>
      <Hero />

      <Gigs />

      <FbNews />

      <Stats />

      <Sponsors />

      <AboutUs />

      <Platforms />

      <Videoclip />

      <Lineup />
    </>
  );
}
