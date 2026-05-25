'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  IconPhoto,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import {useEffect, useMemo, useRef} from 'react';

import {IMAGE_ACCEPT_STRING} from '@/lib/utils/uploadStorageImage';

import type {MerchImageItem} from './merchProductForm';

type MerchImagesFieldProps = {
  images: MerchImageItem[];
  coverIndex: number | null;
  onChangeAction: (images: MerchImageItem[], coverIndex: number | null) => void;
  disabled?: boolean;
};

function getImageSrc(item: MerchImageItem, objectUrl: string | null): string {
  return item.type === 'existing' ? item.url : (objectUrl ?? '');
}

function getImageLabel(item: MerchImageItem): string {
  return item.type === 'existing' ? 'Uložený obrázek' : item.file.name;
}

export function MerchImagesField({
  images,
  coverIndex,
  onChangeAction,
  disabled,
}: MerchImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const objectUrls = useMemo(
    () =>
      images.map((item) =>
        item.type === 'new' ? URL.createObjectURL(item.file) : null,
      ),
    [images],
  );

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [objectUrls]);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected?.length) return;
    const newItems: MerchImageItem[] = Array.from(selected).map((file) => ({
      type: 'new',
      file,
    }));
    const updated = [...images, ...newItems];
    onChangeAction(updated, coverIndex ?? 0);
    e.target.value = '';
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    let newCover = coverIndex;
    if (coverIndex === index) {
      newCover = updated.length > 0 ? 0 : null;
    } else if (coverIndex !== null && index < coverIndex) {
      newCover = coverIndex - 1;
    }
    onChangeAction(updated, newCover);
  }

  function setCover(index: number) {
    onChangeAction(images, index);
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text fw={500} size="sm">
          Fotky produktu
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconUpload size={14} />}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}>
          Přidat fotky
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT_STRING}
          multiple
          style={{display: 'none'}}
          onChange={handleFilesSelected}
        />
      </Group>

      {images.length === 0 ? (
        <UnstyledButton
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--mantine-spacing-xs)',
            padding: 'var(--mantine-spacing-xl) 0',
            width: '100%',
            border: '2px dashed var(--mantine-color-default-border)',
            borderRadius: 'var(--mantine-radius-sm)',
          }}>
          <IconPhoto size={24} opacity={0.4} />
          <Text size="sm" c="dimmed">
            Zatím žádné fotky. Klikni sem.
          </Text>
        </UnstyledButton>
      ) : (
        <SimpleGrid cols={{base: 2, sm: 3}} spacing="xs">
          {images.map((item, index) => {
            const isCover = coverIndex === index;
            const src = getImageSrc(item, objectUrls[index]);
            const label = getImageLabel(item);
            return (
              <Stack
                key={`${item.type}-${item.type === 'existing' ? item.fileId : item.file.name}-${index}`}
                gap={4}
                style={{
                  position: 'relative',
                  border: isCover
                    ? '2px solid var(--mantine-color-yellow-6)'
                    : '1px solid var(--mantine-color-default-border)',
                  borderRadius: 'var(--mantine-radius-sm)',
                  overflow: 'hidden',
                }}>
                {isCover && (
                  <Badge
                    size="xs"
                    color="yellow"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      zIndex: 1,
                    }}>
                    Cover
                  </Badge>
                )}
                <Image src={src} alt={label} h={100} fit="cover" />
                <Group justify="space-between" px={4} pb={4}>
                  <Text size="xs" c="dimmed" lineClamp={1} style={{flex: 1}}>
                    {label}
                  </Text>
                  <Group gap={2} wrap="nowrap">
                    <Tooltip
                      label={
                        isCover ? 'Hlavní obrázek' : 'Nastavit jako cover'
                      }>
                      <ActionIcon
                        variant="subtle"
                        color="yellow"
                        size="xs"
                        disabled={disabled}
                        onClick={() => setCover(index)}
                        aria-label="Nastavit jako cover">
                        {isCover ? (
                          <IconStarFilled size={12} />
                        ) : (
                          <IconStar size={12} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Odebrat">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="xs"
                        disabled={disabled}
                        onClick={() => removeImage(index)}
                        aria-label="Odebrat fotku">
                        <IconTrash size={12} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Stack>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
