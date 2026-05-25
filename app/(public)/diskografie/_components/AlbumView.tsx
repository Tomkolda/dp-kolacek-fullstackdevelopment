'use client';

import {
  ActionIcon,
  Alert,
  Box,
  Loader,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import {IconAlertCircle, IconX} from '@tabler/icons-react';
import type {CSSProperties} from 'react';

import type {
  AlbumListItem,
  GetAlbumDetailActionFn,
} from '@/lib/server/getAlbums';
import {getImageUrl} from '@/lib/utils/getImageUrl';

import {AlbumBooklet} from './AlbumBooklet';
import {AlbumCard} from './AlbumCard';
import {AlbumCredits} from './AlbumCredits';
import {AlbumHero} from './AlbumHero';
import {AlbumTracklist} from './AlbumTracklist';
import classes from './AlbumView.module.css';
import {useAlbumDetail} from './useAlbumDetail';

type AlbumViewProps = {
  album: AlbumListItem;
  getAlbumDetailAction: GetAlbumDetailActionFn;
};

export function AlbumView({album, getAlbumDetailAction}: AlbumViewProps) {
  const {isOpen, isLoading, errorMessage, detail, dominantColor, open, close} =
    useAlbumDetail(album.id, getAlbumDetailAction);

  const coverImageUrl = album.coverImage
    ? getImageUrl('albums', album.coverImage)
    : null;

  return (
    <>
      <AlbumCard
        title={album.title}
        releaseYear={album.releaseDate.slice(0, 4)}
        coverImageUrl={coverImageUrl}
        onClick={() => void open()}
      />

      <Modal
        opened={isOpen}
        onClose={close}
        fullScreen
        withCloseButton={false}
        title=""
        aria-label={
          detail
            ? `Detail alba: ${detail.title}`
            : `Detail alba: ${album.title}`
        }
        classNames={{
          inner: classes.modalInner,
          content: classes.modalContent,
          header: classes.modalHeader,
          body: classes.modalBody,
        }}>
        <Box className={classes.modalViewport}>
          <ActionIcon
            variant="subtle"
            color="dark"
            size="lg"
            radius="xl"
            aria-label="Zavřít detail alba"
            className={classes.closeButton}
            onClick={close}>
            <IconX size={20} stroke={2} />
          </ActionIcon>

          <Box className={classes.modalSurface}>
            {isLoading ? (
              <Box py="xl" className={classes.modalLoading}>
                <Loader size="md" />
                <Text c="dimmed" size="sm">
                  Načítám detail alba...
                </Text>
              </Box>
            ) : errorMessage ? (
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="red"
                radius="md"
                title="Chyba načtení">
                {errorMessage}
              </Alert>
            ) : detail ? (
              <Stack
                gap="md"
                className={classes.detailLayout}
                style={
                  dominantColor
                    ? ({'--album-color': dominantColor} as CSSProperties)
                    : undefined
                }>
                <AlbumHero detail={detail} />
                <AlbumCredits
                  producedBy={detail.producedBy}
                  mixedBy={detail.mixedBy}
                  recordedBy={detail.recordedBy}
                />
                {detail.tracks && detail.tracks.length > 0 ? (
                  <AlbumTracklist tracks={detail.tracks} />
                ) : null}
                {detail.bookletImages && detail.bookletImages.length > 0 ? (
                  <AlbumBooklet
                    title={detail.title}
                    bookletImages={detail.bookletImages}
                  />
                ) : null}
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Modal>
    </>
  );
}
