import {AnimatedLogos} from '@/components/ui/AnimatedLogos';
import {getSponsors} from '@/lib/server/getSponsors';

export async function Sponsors() {
  const sponsors = await getSponsors();

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section id="sponsors">
      <AnimatedLogos items={sponsors} title="Naši partneři" />
    </section>
  );
}
