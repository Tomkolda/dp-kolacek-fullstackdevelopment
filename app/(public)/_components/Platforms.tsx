import {AnimatedLogos} from '@/components/ui/AnimatedLogos';
import {getPlatforms} from '@/lib/server/getPlatforms';

export async function Platforms() {
  const platforms = await getPlatforms();

  if (platforms.length === 0) {
    return null;
  }

  return (
    <section id="platforms">
      <AnimatedLogos
        items={platforms}
        title="Kde nás najdete"
        logoHeight={56}
        gap="calc(var(--mantine-spacing-lg) * 4)"
      />
    </section>
  );
}
