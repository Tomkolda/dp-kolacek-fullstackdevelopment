'use client';

import {
  Alert,
  Button,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useCallback, useState} from 'react';

import adminModalClasses from '@/components/shared/AdminModal/Modal.module.css';
import {useFormSubmit} from '@/components/shared/AdminModal/useFormSubmit';
import {createGallery, type GalleryFileInput} from '@/lib/server/createGallery';
import {getImageDimensions} from '@/lib/utils/image';
import {
  buildGalleryStoragePath,
  cleanupGalleryFiles,
  uploadGalleryFile,
} from '@/lib/utils/storage';

import {
  galleryFormValidate,
  type GalleryFormValues,
  initialGalleryFormValues,
  toGalleryInput,
} from './galleryForm';
import {GalleryPhotosField} from './GalleryPhotosField';
import {GallerySlugField} from './GallerySlugField';

type CreateGalleryModalProps = {
  opened: boolean;
  onCloseAction: () => void;
};

export function CreateGalleryModal({
  opened,
  onCloseAction,
}: CreateGalleryModalProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const form = useForm<GalleryFormValues>({
    initialValues: initialGalleryFormValues,
    validate: galleryFormValidate,
  });

  const onReset = useCallback(() => {
    form.reset();
    setPhotos([]);
    setCoverIndex(null);
    setUploadProgress(null);
  }, [form]);

  const {isSaving, error, handleSubmit, handleClose} = useFormSubmit({
    onCloseAction,
    onResetAction: onReset,
    errorMessage: 'Nepodařilo se vytvořit galerii.',
    successNotification: 'Galerie vytvořena',
    errorNotification: 'Chyba při vytváření galerie',
  });

  async function onFormSubmit(values: GalleryFormValues) {
    await handleSubmit(async () => {
      const galleryInput = toGalleryInput(values);
      const fileInputs: GalleryFileInput[] = [];

      if (photos.length > 0) {
        setUploadProgress({current: 0, total: photos.length});
        const uploadedPaths: string[] = [];

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const storagePath = buildGalleryStoragePath(galleryInput.slug, photo);

          const uploadResult = await uploadGalleryFile(storagePath, photo);
          if (!uploadResult.success) {
            await cleanupGalleryFiles(uploadedPaths);
            return {success: false as const, error: uploadResult.error};
          }

          uploadedPaths.push(storagePath);
          const dimensions = await getImageDimensions(photo);

          fileInputs.push({
            storagePath,
            originalName: photo.name,
            mimeType: photo.type,
            sizeBytes: photo.size,
            width: dimensions?.width ?? null,
            height: dimensions?.height ?? null,
          });

          setUploadProgress({current: i + 1, total: photos.length});
        }
      }

      return createGallery({
        ...galleryInput,
        files: fileInputs,
        coverFileIndex: coverIndex,
      });
    });
  }

  const progressPercent =
    uploadProgress && uploadProgress.total > 0
      ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
      : 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Nová galerie"
      size="xl"
      closeOnClickOutside={!isSaving}
      closeOnEscape={!isSaving}>
      <form
        onSubmit={form.onSubmit((vals) => {
          void onFormSubmit(vals);
        })}>
        <Stack gap="md">
          {error ? (
            <Alert color="red" title="Chyba">
              {error}
            </Alert>
          ) : null}

          <TextInput
            label="Název"
            placeholder="Např. Koncert v Praze"
            withAsterisk
            disabled={isSaving}
            {...form.getInputProps('title')}
          />

          <TextInput
            label="Datum"
            type="date"
            disabled={isSaving}
            {...form.getInputProps('date')}
          />

          <GallerySlugField
            title={form.getValues().title}
            date={form.getValues().date}
            value={form.getValues().slug}
            error={
              typeof form.errors.slug === 'string'
                ? form.errors.slug
                : undefined
            }
            disabled={isSaving}
            onChangeAction={(slug) => {
              form.setFieldValue('slug', slug);
              form.clearFieldError('slug');
            }}
          />

          <Textarea
            label="Popis"
            placeholder="Volitelný popis galerie"
            autosize
            minRows={2}
            maxRows={5}
            disabled={isSaving}
            {...form.getInputProps('description')}
          />

          <GalleryPhotosField
            files={photos}
            coverIndex={coverIndex}
            onFilesChangeAction={setPhotos}
            onCoverChangeAction={setCoverIndex}
            disabled={isSaving}
          />

          {isSaving && uploadProgress && uploadProgress.total > 0 && (
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Nahrávání fotek: {uploadProgress.current} /{' '}
                {uploadProgress.total}
              </Text>
              <Progress value={progressPercent} size="sm" animated />
            </div>
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose} disabled={isSaving}>
              Zrušit
            </Button>
            <Button
              type="submit"
              className={adminModalClasses.submitButton}
              loading={isSaving}>
              Vytvořit galerii
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
