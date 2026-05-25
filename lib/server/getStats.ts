import type {StatItem} from '@/components/ui/StatCounters';
import {getWebItemByKey} from '@/lib/server/getWebItem';

export async function getStats(): Promise<StatItem[]> {
  const stats = await getWebItemByKey('stats');
  if (!stats) return [];

  const currentYear = new Date().getFullYear();
  const items: StatItem[] = [];

  if (typeof stats.albumCount === 'number') {
    items.push({
      value: stats.albumCount,
      description: 'studiových alb',
    });
  }

  if (typeof stats.concertCount === 'number') {
    items.push({
      value: stats.concertCount,
      suffix: '+',
      description: 'odehraných koncertů',
    });
  }

  if (typeof stats.clipCount === 'number') {
    items.push({
      value: stats.clipCount,
      description: 'oficiálních videoklipů',
    });
  }

  if (typeof stats.foundedYear === 'number') {
    items.push({
      value: Math.max(0, currentYear - stats.foundedYear),
      description: 'let existence',
    });
  }

  return items;
}
