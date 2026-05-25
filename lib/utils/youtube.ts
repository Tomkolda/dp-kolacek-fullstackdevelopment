const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * Converts any recognised YouTube URL into a safe embed URL.
 * Returns `null` for non-YouTube or malformed input.
 */
export function toYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
      return null;
    if (!YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase())) return null;

    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtu.be') {
      const id = parsed.pathname.replace(/^\/+/, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.pathname.startsWith('/embed/')) {
      const videoId = parsed.pathname.split('/')[2];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}
