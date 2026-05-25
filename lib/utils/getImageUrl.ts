export function getImageUrl(bucket: string, path: string) {
  const encodedBucket = encodeURIComponent(bucket);
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${encodedBucket}/${encodedPath}`;
}
