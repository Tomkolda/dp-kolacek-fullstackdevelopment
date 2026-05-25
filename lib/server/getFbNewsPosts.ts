import 'server-only';

import {cache} from 'react';

const FACEBOOK_API_VERSION = 'v21.0';
const POSTS_FIELDS =
  'message,created_time,full_picture,permalink_url,attachments{type}';

export type FbPostMediaType = 'photo' | 'video' | 'none';

export type FbPost = {
  id: string;
  message: string | null;
  createdTime: string;
  fullPicture: string | null;
  permalinkUrl: string;
  mediaType: FbPostMediaType;
};

type FbGraphAttachment = {
  type?: string;
};

type FbGraphPost = {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  attachments?: {data?: FbGraphAttachment[]};
};

type FbGraphResponse = {
  data?: FbGraphPost[];
  error?: {message: string; type: string; code: number};
};

function getFbConfig(): {pageId: string; token: string} {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;
  if (!pageId || !token) {
    throw new Error('Missing FB_PAGE_ID or FB_PAGE_TOKEN env variable.');
  }
  return {pageId, token};
}

function resolveMediaType(post: FbGraphPost): FbPostMediaType {
  const type = post.attachments?.data?.[0]?.type ?? '';
  if (type.includes('video')) return 'video';
  if (type.includes('photo') || type.includes('image') || post.full_picture)
    return 'photo';
  return 'none';
}

function toFbPost(raw: FbGraphPost): FbPost {
  return {
    id: raw.id,
    message: raw.message ?? null,
    createdTime: raw.created_time,
    fullPicture: raw.full_picture ?? null,
    permalinkUrl: raw.permalink_url,
    mediaType: resolveMediaType(raw),
  };
}

async function fetchFbNewsPosts(limit = 4): Promise<FbPost[]> {
  let pageId: string;
  let token: string;
  try {
    ({pageId, token} = getFbConfig());
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[getFbNewsPosts] FB_PAGE_ID or FB_PAGE_TOKEN is not set');
    return [];
  }

  const url = new URL(
    `${FACEBOOK_API_VERSION}/${encodeURIComponent(pageId)}/posts`,
    'https://graph.facebook.com',
  );
  url.searchParams.set('fields', POSTS_FIELDS);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('access_token', token);

  try {
    const res = await fetch(url.toString(), {next: {revalidate: 600}});

    if (!res.ok) {
      let errorMessage = 'unknown';
      try {
        const body = (await res.json()) as {
          error?: {message?: string; code?: number};
        };
        errorMessage = body?.error?.message ?? 'unknown';
      } catch {
        // body is not JSON
      }
      // eslint-disable-next-line no-console
      console.error(
        `[getFbNewsPosts] Facebook API error: ${res.status} – ${errorMessage}`,
      );
      return [];
    }

    const json = (await res.json()) as FbGraphResponse;

    if (json.error) {
      // eslint-disable-next-line no-console
      console.error('[getFbNewsPosts] Graph API error:', json.error.message);
      return [];
    }

    return (json.data ?? []).map(toFbPost);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getFbNewsPosts] Failed to fetch:', error);
    return [];
  }
}

export const getFbNewsPosts = cache((limit?: number) =>
  fetchFbNewsPosts(limit),
);
