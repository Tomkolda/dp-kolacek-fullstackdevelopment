'use client';

import {Badge, Image, Text} from '@mantine/core';
import {
  IconBrandApple,
  IconBrandSpotify,
  IconBrandTidal,
  IconBrandYoutube,
  IconShoppingBag,
} from '@tabler/icons-react';
import {DateTime} from 'luxon';
import Link from 'next/link';
import {useMemo} from 'react';

import type {BeaconType} from '@/db/types';
import type {BeaconWithImage} from '@/lib/server/getBeacon';
import {isHttpUrl} from '@/lib/utils/url';
import {toYoutubeEmbedUrl} from '@/lib/utils/youtube';

import classes from './BeaconPage.module.css';

type Props = {
  beacon: BeaconWithImage;
};

const TYPE_LABELS: Record<BeaconType, string> = {
  single: 'Single',
  album: 'Album',
  musicvideo: 'Music Video',
};

function formatDate(dateStr: string): string {
  const dt = DateTime.fromISO(dateStr, {zone: 'utc'});
  return dt.isValid ? dt.toFormat('d. M. yyyy') : dateStr;
}

export function BeaconPage({beacon}: Props) {
  const links = useMemo(
    () =>
      [
        {
          href: beacon.youtubeLink,
          label: 'YouTube',
          icon: <IconBrandYoutube />,
          className: classes.youtube,
        },
        {
          href: beacon.spotifyLink,
          label: 'Spotify',
          icon: <IconBrandSpotify />,
          className: classes.spotify,
        },
        {
          href: beacon.appleLink,
          label: 'Apple Music',
          icon: <IconBrandApple />,
          className: classes.apple,
        },
        {
          href: beacon.tidalLink,
          label: 'Tidal',
          icon: <IconBrandTidal />,
          className: classes.tidal,
        },
        {
          href: beacon.merchLink,
          label: 'Merch',
          icon: <IconShoppingBag />,
          className: classes.merch,
        },
      ].filter((l) => l.href && isHttpUrl(l.href)),
    [beacon],
  );

  return (
    <div className={classes.page}>
      {beacon.imageUrl ? (
        <>
          <div
            className={classes.backgroundImage}
            style={{backgroundImage: `url("${beacon.imageUrl}")`}}
          />
          <div className={classes.backgroundOverlay} />
        </>
      ) : (
        <div className={classes.backgroundFallback} />
      )}

      <div className={classes.content}>
        {/* Cover art */}
        <div className={classes.coverWrapper}>
          {beacon.imageUrl ? (
            <Image
              src={beacon.imageUrl}
              alt={beacon.title}
              w={280}
              h={280}
              className={classes.coverImage}
              fit="cover"
            />
          ) : (
            <div className={classes.coverFallback}>
              <Text c="dimmed" size="sm">
                {beacon.title}
              </Text>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={classes.info}>
          <h1 className={classes.title}>{beacon.title}</h1>
          {beacon.subtitle && (
            <p className={classes.subtitle}>{beacon.subtitle}</p>
          )}
          <div className={classes.meta}>
            <Badge color="myColor" variant="filled" size="sm">
              {TYPE_LABELS[beacon.type] ?? beacon.type}
            </Badge>
            <Badge variant="light" color="gray" size="sm">
              {formatDate(beacon.releaseDate)}
            </Badge>
          </div>
          {beacon.description && (
            <p className={classes.description}>{beacon.description}</p>
          )}
        </div>

        {/* YouTube embed */}
        {toYoutubeEmbedUrl(beacon.youtubeEmbedUrl) && (
          <div className={classes.youtubeWrapper}>
            <iframe
              className={classes.youtubeIframe}
              src={toYoutubeEmbedUrl(beacon.youtubeEmbedUrl)!}
              title={`${beacon.title} – video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Streaming links */}
        {links.length > 0 && (
          <div className={classes.links}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href!}
                target="_blank"
                rel="noopener noreferrer"
                className={`${classes.linkButton} ${link.className}`}>
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Branding */}
        <div className={classes.branding}>
          <Link href="/" className={classes.brandingLink}>
            Free Fall
          </Link>
        </div>
      </div>
    </div>
  );
}
