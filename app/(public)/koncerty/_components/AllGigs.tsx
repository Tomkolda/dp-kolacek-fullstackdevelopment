import {Box, Title} from '@mantine/core';

import {GigGrid} from '@/components/shared/GigGrid';
import {getGigs} from '@/lib/server/getGigs';

/** Fetches and displays all upcoming gigs on the dedicated gigs page. */
export async function AllGigs() {
  const allGigs = await getGigs();
  return (
    <section id="gigs">
      <Box>
        <Title order={1} ta="center" mb="xl">
          image.png Koncerty
        </Title>
        <GigGrid gigs={allGigs} />
      </Box>
    </section>
  );
}
