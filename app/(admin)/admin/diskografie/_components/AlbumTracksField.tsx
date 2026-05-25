'use client';

import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {IconPlus, IconTrash} from '@tabler/icons-react';

import type {AlbumTrack} from '@/db/schema';

export type AlbumTrackFormValue = {
  trackNumber: number;
  title: string;
  duration: string;
  videoLink: string;
  originalTrack?: AlbumTrack;
};

type AlbumTracksFieldProps = {
  value: AlbumTrackFormValue[];
  onChangeAction: (tracks: AlbumTrackFormValue[]) => void;
  disabled?: boolean;
};

const EMPTY_TRACK: AlbumTrackFormValue = {
  trackNumber: 1,
  title: '',
  duration: '',
  videoLink: '',
};

function normalizeTrackNumbers(tracks: AlbumTrackFormValue[]) {
  return tracks.map((track, index) => ({
    ...track,
    trackNumber: index + 1,
  }));
}

export function AlbumTracksField({
  value,
  onChangeAction,
  disabled,
}: AlbumTracksFieldProps) {
  function addTrack() {
    onChangeAction(
      normalizeTrackNumbers([
        ...value,
        {...EMPTY_TRACK, trackNumber: value.length + 1},
      ]),
    );
  }

  function removeTrack(index: number) {
    onChangeAction(normalizeTrackNumbers(value.filter((_, i) => i !== index)));
  }

  function updateTrack(index: number, patch: Partial<AlbumTrackFormValue>) {
    onChangeAction(
      normalizeTrackNumbers(
        value.map((track, i) => (i === index ? {...track, ...patch} : track)),
      ),
    );
  }

  return (
    <Stack gap="sm" w="100%">
      <Group justify="space-between" align="center">
        <div>
          <Title order={4}>Skladby</Title>
          <Text size="sm" c="dimmed">
            Přidejte tracklist alba v pořadí, v jakém se má zobrazit.
          </Text>
        </div>
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={addTrack}
          disabled={disabled}>
          Přidat skladbu
        </Button>
      </Group>

      {value.length === 0 ? (
        <Paper withBorder radius="md" p="md">
          <Text size="sm" c="dimmed">
            Zatím nejsou přidané žádné skladby.
          </Text>
        </Paper>
      ) : (
        value.map((track, index) => (
          <Paper
            key={`${track.trackNumber}-${index}`}
            withBorder
            radius="md"
            p="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Title order={5}>Skladba {index + 1}</Title>
                  <Text size="sm" c="dimmed">
                    Pořadí se ukládá automaticky.
                  </Text>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Odebrat skladbu"
                  onClick={() => removeTrack(index)}
                  disabled={disabled}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

              <Group grow align="flex-start">
                <TextInput
                  label="Název"
                  placeholder="Např. Intro"
                  value={track.title}
                  onChange={(event) =>
                    updateTrack(index, {title: event.currentTarget.value})
                  }
                  disabled={disabled}
                />
                <TextInput
                  label="Délka"
                  placeholder="3:24"
                  value={track.duration}
                  onChange={(event) =>
                    updateTrack(index, {duration: event.currentTarget.value})
                  }
                  disabled={disabled}
                />
                <TextInput
                  label="YouTube odkaz"
                  placeholder="https://youtube.com/..."
                  value={track.videoLink}
                  onChange={(event) =>
                    updateTrack(index, {videoLink: event.currentTarget.value})
                  }
                  disabled={disabled}
                />
              </Group>
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );
}
