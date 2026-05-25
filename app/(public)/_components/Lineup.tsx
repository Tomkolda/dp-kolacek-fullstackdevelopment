import {Box} from '@mantine/core';

import {TeamGrid} from '@/components/ui/Team';
import {getBandMembers} from '@/lib/server/getLineup';

/** Renders the band lineup section with all current members. */
export async function Lineup() {
  const members = await getBandMembers();
  return (
    <section id="lineup">
      <Box>
        <TeamGrid members={members} />
      </Box>
    </section>
  );
}
