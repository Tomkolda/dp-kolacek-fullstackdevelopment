import {getImageUrl} from '@/lib/utils/getImageUrl';

const STORAGE_PATH_PATTERN =
  /^([a-z0-9][a-z0-9._-]*)\/([A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/;

export function resolvePublicImageUrl(
  storagePath?: string | null,
): string | null {
  if (!storagePath) return null;

  const normalizedPath = storagePath.trim();
  const match = STORAGE_PATH_PATTERN.exec(normalizedPath);
  if (!match) return null;

  const [, bucket, path] = match;
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return getImageUrl(bucket, encodedPath);
}
