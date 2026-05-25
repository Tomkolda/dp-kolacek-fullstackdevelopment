'use client';

import {
  AspectRatio,
  Box,
  Card,
  CardSection,
  Group,
  Image,
  Text,
} from '@mantine/core';
import {IconBrandFacebook, IconPlayerPlayFilled} from '@tabler/icons-react';
import {DateTime} from 'luxon';
import {useState} from 'react';

import type {FbPost} from '@/lib/server/getFbNewsPosts';

import classes from './FbNews.module.css';

function formatPostDate(isoDate: string): string {
  const dt = DateTime.fromISO(isoDate, {zone: 'utc'}).setLocale('cs');
  return dt.toRelative() ?? dt.toLocaleString(DateTime.DATE_MED);
}

function truncateMessage(message: string, maxLength = 200): string {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength).trimEnd()}…`;
}

function VideoEmbed({permalinkUrl}: {permalinkUrl: string}) {
  const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(permalinkUrl)}&show_text=false&autoplay=true`;

  return (
    <AspectRatio ratio={16 / 9}>
      <iframe
        src={embedSrc}
        title="Facebook video"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{border: 'none'}}
      />
    </AspectRatio>
  );
}

export function PostCard({post}: {post: FbPost}) {
  const [playing, setPlaying] = useState(false);
  const isVideo = post.mediaType === 'video';

  const fbLink = {
    href: post.permalinkUrl,
    target: '_blank' as const,
    rel: 'noopener noreferrer',
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {isVideo && playing ? (
        <CardSection>
          <VideoEmbed permalinkUrl={post.permalinkUrl} />
        </CardSection>
      ) : isVideo && post.fullPicture ? (
        <CardSection pos="relative">
          <button
            type="button"
            aria-label="Přehrát video z Facebooku"
            onClick={() => setPlaying(true)}
            className={classes.videoButton}>
            <AspectRatio ratio={16 / 9}>
              <Image
                src={post.fullPicture}
                alt=""
                h="100%"
                fit="contain"
                bg="var(--mantine-color-gray-1)"
                fallbackSrc="https://placehold.co/600x400?text=Facebook"
              />
            </AspectRatio>
            <Box className={classes.playOverlay}>
              <IconPlayerPlayFilled size={40} color="white" />
            </Box>
          </button>
        </CardSection>
      ) : (
        post.fullPicture && (
          <CardSection>
            <a
              href={post.permalinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zobrazit příspěvek na Facebooku">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={post.fullPicture}
                  alt=""
                  h="100%"
                  fit="contain"
                  bg="var(--mantine-color-gray-1)"
                  fallbackSrc="https://placehold.co/600x400?text=Facebook"
                />
              </AspectRatio>
            </a>
          </CardSection>
        )
      )}

      {post.message && (
        <Text
          component="a"
          {...fbLink}
          mt="sm"
          size="sm"
          lineClamp={4}
          style={{textDecoration: 'none', color: 'inherit'}}>
          {truncateMessage(post.message, 300)}
        </Text>
      )}

      <Group mt="md" justify="space-between">
        <Group gap="xs">
          <IconBrandFacebook size={16} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed">
            {formatPostDate(post.createdTime)}
          </Text>
        </Group>
        <Text
          component="a"
          href={post.permalinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          c="dimmed"
          td="underline">
          Facebook
        </Text>
      </Group>
    </Card>
  );
}
