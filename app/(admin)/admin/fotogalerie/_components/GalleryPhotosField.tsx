'use client';

import {
  ActionIcon,
  Group,
  Image,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import {Dropzone, IMAGE_MIME_TYPE} from '@mantine/dropzone';
import {
  IconPhoto,
  IconStarFilled,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import {useCallback, useEffect, useMemo, useRef} from 'react';

import {
  GALLERY_MAX_FILE_SIZE_BYTES,
  GALLERY_MAX_FILE_SIZE_MB,
} from '@/lib/utils/storage';

type GalleryPhotosFieldProps = {
  files: File[];
  coverIndex: number | null;
  onFilesChangeAction: (files: File[]) => void;
  onCoverChangeAction: (index: number | null) => void;
  disabled?: boolean;
};

export function GalleryPhotosField({
  files,
  coverIndex,
  onFilesChangeAction,
  onCoverChangeAction,
  disabled,
}: GalleryPhotosFieldProps) {
  const objectUrlsRef = useRef<string[]>([]);

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    const prev = objectUrlsRef.current;
    objectUrlsRef.current = previews;
    return () => {
      prev.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleDrop = useCallback(
    (accepted: File[]) => {
      onFilesChangeAction([...files, ...accepted]);
    },
    [files, onFilesChangeAction],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onFilesChangeAction(files.filter((_, i) => i !== index));
      if (coverIndex === index) {
        onCoverChangeAction(null);
      } else if (coverIndex !== null && index < coverIndex) {
        onCoverChangeAction(coverIndex - 1);
      }
    },
    [files, coverIndex, onFilesChangeAction, onCoverChangeAction],
  );

  return (
    <div>
      <Text fw={500} size="sm" mb={4}>
        Fotky
      </Text>

      <Dropzone
        onDrop={handleDrop}
        accept={IMAGE_MIME_TYPE}
        maxSize={GALLERY_MAX_FILE_SIZE_BYTES}
        disabled={disabled}>
        <Group
          justify="center"
          gap="xl"
          mih={100}
          style={{pointerEvents: 'none'}}>
          <Dropzone.Accept>
            <IconUpload size={40} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={40} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={40} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="md" inline>
              Přetáhněte fotky sem nebo klikněte pro výběr
            </Text>
            <Text size="xs" c="dimmed" inline mt={7}>
              Povolené formáty: JPG, PNG, GIF, WebP, AVIF. Max{' '}
              {GALLERY_MAX_FILE_SIZE_MB} MB na soubor.
            </Text>
          </div>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <SimpleGrid cols={{base: 3, sm: 4, md: 6}} mt="md" spacing="xs">
          {previews.map((url, index) => (
            <div
              key={`${files[index].name}-${index}`}
              style={{position: 'relative'}}>
              <Image
                src={url}
                alt={files[index].name}
                h={100}
                w="100%"
                fit="cover"
                radius="sm"
              />
              <Tooltip
                label={
                  coverIndex === index ? 'Titulní fotka' : 'Nastavit jako cover'
                }>
                <ActionIcon
                  variant="filled"
                  color={coverIndex === index ? 'yellow' : 'gray'}
                  size="xs"
                  aria-label={
                    coverIndex === index
                      ? 'Titulní fotka'
                      : 'Nastavit jako cover'
                  }
                  style={{position: 'absolute', top: 4, left: 4}}
                  onClick={() =>
                    onCoverChangeAction(coverIndex === index ? null : index)
                  }
                  disabled={disabled}>
                  <IconStarFilled size={12} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Odebrat">
                <ActionIcon
                  variant="filled"
                  color="red"
                  size="xs"
                  aria-label="Odebrat"
                  style={{position: 'absolute', top: 4, right: 4}}
                  onClick={() => handleRemove(index)}
                  disabled={disabled}>
                  <IconTrash size={12} />
                </ActionIcon>
              </Tooltip>
            </div>
          ))}
        </SimpleGrid>
      )}

      {files.length > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          {files.length}{' '}
          {files.length === 1 ? 'fotka' : files.length < 5 ? 'fotky' : 'fotek'}{' '}
          vybráno
        </Text>
      )}
    </div>
  );
}
