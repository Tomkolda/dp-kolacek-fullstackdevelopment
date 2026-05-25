'use client';

import {Button, Group, Image, Input, Select, Stack, Text} from '@mantine/core';
import {IconPhoto, IconUpload} from '@tabler/icons-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  getStorageImages,
  type StorageImageFile,
} from '@/lib/server/getStorageImages';
import {IMAGE_ACCEPT_STRING} from '@/lib/utils/uploadStorageImage';

type StorageImagePickerProps = {
  /** Supabase storage bucket name. */
  bucket: string;
  /** Field label. @default "Obrázek" */
  label?: string;
  /** Marks the field as required in UI. */
  required?: boolean;
  /** Currently selected existing file name. */
  value: string;
  /** Called when an existing image is selected from the dropdown. */
  onChangeAction: (value: string) => void;
  /** Called when user picks a local file for upload (or clears it). */
  onPendingFileChangeAction?: (file: File | null) => void;
  /** Pending local file selected for deferred upload. */
  pendingFile?: File | null;
  /** Validation error from the form. */
  error?: string;
  /** Disable interactions while parent form is saving. */
  disabled?: boolean;
};

/**
 * Reusable image picker that lists files from a Supabase storage bucket
 * and lets the user pick a local file for deferred upload.
 *
 * The component does NOT upload — it only stores the File locally and
 * shows a blob preview. The parent is responsible for uploading via
 * `uploadStorageImage()` during form submission.
 */
export function StorageImagePicker({
  bucket,
  label = 'Obrázek',
  required = false,
  value,
  onChangeAction,
  onPendingFileChangeAction,
  pendingFile = null,
  error,
  disabled,
}: StorageImagePickerProps) {
  const [images, setImages] = useState<StorageImageFile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await getStorageImages(bucket);
      setImages(result);
    } catch {
      setImages([]);
      setLoadError('Nepodařilo se načíst obrázky.');
    } finally {
      setIsLoading(false);
    }
  }, [bucket]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  // Blob URL for the local file preview (auto-revoked on change)
  const pendingPreviewUrl = useMemo(() => {
    if (!pendingFile) return null;
    return URL.createObjectURL(pendingFile);
  }, [pendingFile]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const selectData = images.map((img) => ({
    value: img.name,
    label: img.name,
  }));

  const selectedImage = images.find((img) => img.name === value);

  function handleSelectChange(val: string | null) {
    onChangeAction(val ?? '');
    // Clear pending file when user picks an existing image
    onPendingFileChangeAction?.(null);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      // Clear the selected existing image
      onChangeAction('');
      onPendingFileChangeAction?.(file);
    }
    // Reset so the same file can be selected again
    e.target.value = '';
  }

  // Determine what preview to show
  const previewUrl = pendingFile ? pendingPreviewUrl : selectedImage?.url;
  const previewAlt = pendingFile ? pendingFile.name : selectedImage?.name;

  return (
    <Stack gap="xs">
      <Input.Label required={required}>{label}</Input.Label>

      <Group align="flex-end" gap="sm">
        <Select
          style={{flex: 1}}
          placeholder={isLoading ? 'Načítám...' : 'Vyberte obrázek'}
          data={selectData}
          value={value || null}
          onChange={handleSelectChange}
          searchable
          clearable
          nothingFoundMessage="Žádné obrázky"
          disabled={disabled}
          leftSection={<IconPhoto size={16} />}
          error={error}
        />
        <Button
          variant="light"
          leftSection={<IconUpload size={16} />}
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}>
          Nahrát
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT_STRING}
          style={{display: 'none'}}
          onChange={handleFileInputChange}
        />
      </Group>
      {loadError ? (
        <Text size="xs" c="red">
          {loadError}
        </Text>
      ) : null}

      {pendingFile ? (
        <Text size="xs" c="blue">
          Připraveno k nahrání: {pendingFile.name}
        </Text>
      ) : null}

      {previewUrl ? (
        <Image
          src={previewUrl}
          alt={previewAlt ?? ''}
          h={120}
          w="100%"
          fit="contain"
          radius="sm"
          fallbackSrc="https://placehold.co/400x120?text=N%C3%A1hled"
        />
      ) : (
        <Text size="xs" c="dimmed">
          Žádný obrázek nebyl vybrán.
        </Text>
      )}
    </Stack>
  );
}
