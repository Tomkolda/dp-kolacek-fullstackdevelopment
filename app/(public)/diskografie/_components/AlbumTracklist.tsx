import {Anchor, Box, Paper, Stack, Text, Title} from '@mantine/core';

import type {AlbumTrack} from '@/db/schema';
import {formatDuration} from '@/lib/utils/datetime';

import classes from './AlbumView.module.css';

type AlbumTracklistProps = {
  tracks: AlbumTrack[];
};

export function AlbumTracklist({tracks}: AlbumTracklistProps) {
  if (tracks.length === 0) return null;

  return (
    <Paper withBorder radius="lg" p="md">
      <Stack gap="sm">
        <Title order={4}>Obsah</Title>
        <Stack gap={2}>
          {tracks.map((track) => (
            <Box
              key={`${track.trackNumber}-${track.title}`}
              className={classes.trackRow}>
              <Text c="dimmed" size="sm" className={classes.trackNumber}>
                {track.trackNumber}.
              </Text>
              <Box className={classes.trackTitleLine}>
                {track.videoLink ? (
                  <Anchor
                    href={track.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.trackTitleLink}>
                    {track.title}
                  </Anchor>
                ) : (
                  <Text fw={500} className={classes.trackTitle}>
                    {track.title}
                  </Text>
                )}
              </Box>
              <Text c="dimmed" size="sm" className={classes.trackDuration}>
                {track.durationSeconds
                  ? formatDuration(track.durationSeconds)
                  : '-'}
              </Text>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
