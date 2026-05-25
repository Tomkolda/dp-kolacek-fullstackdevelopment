import {and, desc, eq, isNull} from 'drizzle-orm';
import {cache} from 'react';

import {db} from '@/db/client';
import {webItems} from '@/db/schema';
import type {WebItemKey, WebItemValueOf} from '@/db/types';
import {
  asNumberOrNull,
  asObject,
  asStringOrNull,
} from '@/lib/utils/variableHelpers';

function normalizeWebItemValue<K extends WebItemKey>(
  value: unknown,
  key: K,
): WebItemValueOf<K> | null {
  const item = asObject(value);
  if (!item || item.type !== key) return null;

  switch (key) {
    case 'contact':
      return {
        type: 'contact',
        email: asStringOrNull(item.email),
        telephone: asStringOrNull(item.telephone),
      } as WebItemValueOf<K>;
    case 'logo':
      return {
        type: 'logo',
        banner: asStringOrNull(item.banner),
        text: asStringOrNull(item.text),
        circle: asStringOrNull(item.circle),
        combined: asStringOrNull(item.combined),
        textDark: asStringOrNull(item.textDark),
        circleDark: asStringOrNull(item.circleDark),
        combinedDark: asStringOrNull(item.combinedDark),
      } as WebItemValueOf<K>;
    case 'organizer_materials':
      return {
        type: 'organizer_materials',
        pressKit: asStringOrNull(item.pressKit),
        logo: asStringOrNull(item.logo),
        technicalRider: asStringOrNull(item.technicalRider),
        stagePlan: asStringOrNull(item.stagePlan),
      } as WebItemValueOf<K>;
    case 'stats':
      return {
        type: 'stats',
        foundedYear: asNumberOrNull(item.foundedYear),
        albumCount: asNumberOrNull(item.albumCount),
        concertCount: asNumberOrNull(item.concertCount),
        clipCount: asNumberOrNull(item.clipCount),
      } as WebItemValueOf<K>;
    case 'fb_news':
      return {
        type: 'fb_news',
        visible: item.visible === true,
        limit: asNumberOrNull(item.limit) ?? 4,
      } as WebItemValueOf<K>;
    case 'video_preview':
      return {
        type: 'video_preview',
        videoUrl: asStringOrNull(item.videoUrl),
        thumbnailUrl: asStringOrNull(item.thumbnailUrl),
        title: asStringOrNull(item.title),
      } as WebItemValueOf<K>;
    default:
      return null;
  }
}

const getWebItemByKeyCached = cache(async (key: WebItemKey) => {
  try {
    const [item] = await db
      .select({value: webItems.value})
      .from(webItems)
      .where(and(eq(webItems.key, key), isNull(webItems.archivedAt)))
      .orderBy(desc(webItems.updatedAt), desc(webItems.createdAt))
      .limit(1);

    if (!item?.value) return null;
    return normalizeWebItemValue(item.value, key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[getWebItemByKey] Failed to fetch key "${key}":`, error);
    return null;
  }
});

export function getWebItemByKey(
  key: 'contact',
): Promise<WebItemValueOf<'contact'> | null>;
export function getWebItemByKey(
  key: 'fb_news',
): Promise<WebItemValueOf<'fb_news'> | null>;
export function getWebItemByKey(
  key: 'logo',
): Promise<WebItemValueOf<'logo'> | null>;
export function getWebItemByKey(
  key: 'organizer_materials',
): Promise<WebItemValueOf<'organizer_materials'> | null>;
export function getWebItemByKey(
  key: 'stats',
): Promise<WebItemValueOf<'stats'> | null>;
export function getWebItemByKey(
  key: 'video_preview',
): Promise<WebItemValueOf<'video_preview'> | null>;
export function getWebItemByKey(key: WebItemKey) {
  return getWebItemByKeyCached(key);
}
