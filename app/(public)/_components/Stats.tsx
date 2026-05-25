import {Box} from '@mantine/core';

import {StatCounters} from '@/components/ui/StatCounters';
import {getStats} from '@/lib/server/getStats';

/** Renders the homepage statistics section with key band metrics. */
export async function Stats() {
  const stats = await getStats();
  if (stats.length === 0) return null;

  return (
    <section id="stats">
      <Box>
        <StatCounters items={stats} />
      </Box>
    </section>
  );
}
