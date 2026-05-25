'use client';

import {Group, Image, Loader, SimpleGrid, Text} from '@mantine/core';
import {IconStarFilled} from '@tabler/icons-react';

import type {AdminGalleryPhoto} from '@/lib/server/getGalleryPhotosAdmin';

type CoverPhotoPickerProps = {
  photos: AdminGalleryPhoto[];
  loading: boolean;
  coverFileId: number | null;
  onCoverChangeAction: (fileId: number | null) => void;
  disabled?: boolean;
};

export function CoverPhotoPicker({
  photos,
  loading,
  coverFileId,
  onCoverChangeAction,
  disabled,
}: CoverPhotoPickerProps) {
  if (loading) {
    return (
      <Group justify="center" py="md">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Načítání fotek...
        </Text>
      </Group>
    );
  }

  if (photos.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        Galerie nemá žádné fotky.
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{base: 3, sm: 4, md: 6}} spacing="xs">
      {photos.map((photo) => {
        const isSelected = coverFileId === photo.fileId;
        return (
          <div
            key={photo.fileId}
            role="button"
            tabIndex={disabled ? -1 : 0}
            style={{
              position: 'relative',
              cursor: disabled ? undefined : 'pointer',
            }}
            onClick={() => {
              if (disabled) return;
              onCoverChangeAction(isSelected ? null : photo.fileId);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (disabled) return;
                onCoverChangeAction(isSelected ? null : photo.fileId);
              }
            }}>
            <Image
              src={photo.url}
              alt=""
              h={100}
              w="100%"
              fit="cover"
              radius="sm"
              style={{
                opacity: disabled ? 0.5 : 1,
                outline: isSelected
                  ? '3px solid var(--mantine-color-yellow-5)'
                  : undefined,
                outlineOffset: -1,
                borderRadius: 'var(--mantine-radius-sm)',
              }}
            />
            {isSelected && (
              <IconStarFilled
                size={16}
                color="var(--mantine-color-yellow-5)"
                style={{position: 'absolute', top: 4, left: 4}}
              />
            )}
          </div>
        );
      })}
    </SimpleGrid>
  );
}
