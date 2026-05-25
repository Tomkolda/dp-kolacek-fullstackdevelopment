'use client';

import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useCallback, useEffect, useRef, useState} from 'react';

import adminModalClasses from '@/components/shared/AdminModal/Modal.module.css';
import {useFormSubmit} from '@/components/shared/AdminModal/useFormSubmit';
import type {AdminGallery} from '@/lib/server/getGalleriesAdmin';
import {
  type AdminGalleryPhoto,
  getGalleryPhotosAdmin,
} from '@/lib/server/getGalleryPhotosAdmin';
import {updateGallery} from '@/lib/server/updateGallery';
import {createRequiredTextValidator} from '@/lib/utils/adminForm';

import {CoverPhotoPicker} from './CoverPhotoPicker';

type EditGalleryFormValues = {
  title: string;
  date: string;
};

type EditGalleryModalProps = {
  opened: boolean;
  gallery: AdminGallery | null;
  onCloseAction: () => void;
};

export function EditGalleryModal({
  opened,
  gallery,
  onCloseAction,
}: EditGalleryModalProps) {
  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [coverFileId, setCoverFileId] = useState<number | null>(null);

  const form = useForm<EditGalleryFormValues>({
    initialValues: {title: '', date: ''},
    validate: {
      title: createRequiredTextValidator('Název je povinný'),
    },
  });
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    if (!opened || !gallery) return;

    const f = formRef.current;
    f.setValues({
      title: gallery.title,
      date: gallery.date ?? '',
    });
    f.resetDirty({
      title: gallery.title,
      date: gallery.date ?? '',
    });
    setCoverFileId(gallery.coverFileId);

    setLoadingPhotos(true);
    let cancelled = false;

    void getGalleryPhotosAdmin(gallery.id)
      .then((result) => {
        if (cancelled) return;
        setPhotos(result);
      })
      .catch(() => {
        if (cancelled) return;
        setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPhotos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [opened, gallery]);

  const onReset = useCallback(() => {
    form.reset();
    setPhotos([]);
    setCoverFileId(null);
  }, [form]);

  const {isSaving, error, handleSubmit, handleClose} = useFormSubmit({
    onCloseAction,
    onResetAction: onReset,
    errorMessage: 'Nepodařilo se upravit galerii.',
    successNotification: 'Galerie upravena',
    errorNotification: 'Chyba při úpravě galerie',
  });

  async function onFormSubmit(values: EditGalleryFormValues) {
    if (!gallery) return;

    await handleSubmit(async () =>
      updateGallery(gallery.id, {
        title: values.title.trim(),
        date: values.date || null,
        coverFileId,
      }),
    );
  }

  if (!gallery) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Upravit galerii"
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

          <div>
            <Text fw={500} size="sm" mb={4}>
              Titulní fotka
            </Text>
            <CoverPhotoPicker
              photos={photos}
              loading={loadingPhotos}
              coverFileId={coverFileId}
              onCoverChangeAction={setCoverFileId}
              disabled={isSaving}
            />
          </div>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose} disabled={isSaving}>
              Zrušit
            </Button>
            <Button
              type="submit"
              className={adminModalClasses.submitButton}
              loading={isSaving}>
              Uložit změny
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
