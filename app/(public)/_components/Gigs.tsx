import {Box, Button, Title} from '@mantine/core';
import {IconArrowRight} from '@tabler/icons-react';

import {GigGrid} from '@/components/shared/GigGrid';
import {getGigs} from '@/lib/server/getGigs';

import classes from './Gigs.module.css';

/** Fetches and displays the closest upcoming gigs with a link to the full list. */
export async function Gigs() {
  const closeGigs = await getGigs({limit: 3});
  return (
    <section id="gigs" className={classes.section}>
      <Box>
        <Title order={1} ta="center" mb="xl">
          Nadcházející koncerty
        </Title>
        <GigGrid gigs={closeGigs} />
        <Box ta="center" mt="xl">
          <ViewAllGigsButton />
        </Box>
      </Box>
    </section>
  );
}

/** CTA button that navigates to the full gigs listing page. */
function ViewAllGigsButton() {
  return (
    <Button
      component="a"
      href="/koncerty"
      size="lg"
      radius="xl"
      className={classes.button}
      rightSection={<IconArrowRight size={18} />}>
      Zobrazit všechny koncerty
    </Button>
  );
}
