'use client';

import {Group, NumberInput, Select, Textarea, TextInput} from '@mantine/core';
import {TimeInput} from '@mantine/dates';
import {type SetFieldValue, useForm} from '@mantine/form';
import {useCallback, useMemo, useState} from 'react';

import {StorageImagePicker} from '@/components/shared/StorageImagePicker';
import {uploadStorageImage} from '@/lib/utils/uploadStorageImage';

import {Modal} from './Modal';
import type {
  FormField as FormFieldType,
  FormSubmit,
  FormValidate,
  FormValues,
  StorageImageField,
} from './types';
import {useFormSubmit} from './useFormSubmit';

type FormProps<T extends FormValues> = {
  opened: boolean;
  onCloseAction: () => void;
  title: string;
  submitLabel?: string;
  errorMessage?: string;
  successNotification?: string;
  errorNotification?: string;
  initialValues: T;
  validate?: FormValidate<T>;
  fields: Array<FormFieldType<T>>;
  onSubmitAction: FormSubmit<T>;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function hasStorageImageValue(
  value: unknown,
  pendingFile: File | null | undefined,
) {
  return asString(value).trim().length > 0 || pendingFile != null;
}

function getRequiredStorageImageMessage<T extends FormValues>(
  field: StorageImageField<T>,
): string {
  const fieldLabel =
    typeof field.label === 'string' && field.label.trim().length > 0
      ? field.label.trim()
      : 'Obrázek';

  return `${fieldLabel} je povinn${fieldLabel.endsWith('a') ? 'á' : 'ý'}`;
}

export function Form<T extends FormValues>({
  opened,
  onCloseAction,
  title,
  submitLabel = 'Uložit',
  errorMessage = 'Nepodařilo se uložit formulář.',
  successNotification,
  errorNotification,
  initialValues,
  validate,
  fields,
  onSubmitAction,
}: FormProps<T>) {
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>(
    {},
  );

  const form = useForm<T>({
    mode: 'uncontrolled',
    initialValues,
    validate,
  });

  const setFieldValue = useCallback<SetFieldValue<T>>(
    (path, value, options) => {
      form.setFieldValue(path, value, options);
    },
    [form],
  );

  const onReset = useCallback(() => {
    form.reset();
    setPendingFiles({});
  }, [form]);

  const {isSaving, error, handleSubmit, handleClose} = useFormSubmit({
    onCloseAction,
    onResetAction: onReset,
    errorMessage,
    successNotification,
    errorNotification,
  });

  const storageImageFields = useMemo(
    () =>
      fields.filter(
        (field): field is StorageImageField<T> => field.type === 'storageImage',
      ),
    [fields],
  );

  async function onFormValues(values: T) {
    for (const field of storageImageFields) {
      if (!field.required) continue;

      if (!hasStorageImageValue(values[field.name], pendingFiles[field.name])) {
        form.setFieldError(field.name, getRequiredStorageImageMessage(field));
        return;
      }
    }

    await handleSubmit(async () => {
      const submitValues: Record<string, unknown> = {...values};

      for (const field of storageImageFields) {
        const pendingFile = pendingFiles[field.name];
        if (!pendingFile) continue;

        const uploadResult = await uploadStorageImage(
          field.bucket,
          pendingFile,
        );
        if (!uploadResult.success) {
          return {success: false, error: uploadResult.error};
        }

        submitValues[field.name] = uploadResult.fileName;
      }

      return onSubmitAction(submitValues as T);
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      submitLabel={submitLabel}
      isSaving={isSaving}
      error={error}
      onFormSubmit={form.onSubmit((vals) => {
        void onFormValues(vals);
      })}>
      {fields.map((field) => {
        if (field.type === 'text' || field.type === 'date') {
          return (
            <TextInput
              key={`${field.name}-${form.key(field.name)}`}
              withAsterisk={field.required}
              type={field.type === 'date' ? 'date' : undefined}
              label={field.label}
              placeholder={field.placeholder}
              {...form.getInputProps(field.name)}
            />
          );
        }

        if (field.type === 'textarea') {
          return (
            <Textarea
              key={`${field.name}-${form.key(field.name)}`}
              withAsterisk={field.required}
              label={field.label}
              placeholder={field.placeholder}
              autosize
              minRows={field.minRows ?? 2}
              maxRows={field.maxRows ?? 5}
              {...form.getInputProps(field.name)}
            />
          );
        }

        if (field.type === 'number') {
          return (
            <NumberInput
              key={`${field.name}-${form.key(field.name)}`}
              withAsterisk={field.required}
              label={field.label}
              placeholder={field.placeholder}
              min={field.min}
              allowNegative={field.allowNegative ?? false}
              {...form.getInputProps(field.name)}
            />
          );
        }

        if (field.type === 'time') {
          return (
            <TimeInput
              key={`${field.name}-${form.key(field.name)}`}
              withAsterisk={field.required}
              label={field.label}
              placeholder={field.placeholder ?? 'HH:mm'}
              {...form.getInputProps(field.name)}
            />
          );
        }

        if (field.type === 'select') {
          return (
            <Select
              key={`${field.name}-${form.key(field.name)}`}
              withAsterisk={field.required}
              label={field.label}
              placeholder={field.placeholder}
              data={field.options}
              {...form.getInputProps(field.name)}
            />
          );
        }

        if (field.type === 'storageImage') {
          const fieldError = form.errors[field.name];
          const hasPendingFile = pendingFiles[field.name] != null;

          return (
            <StorageImagePicker
              key={field.name}
              bucket={field.bucket}
              label={field.label ?? 'Obrázek'}
              required={field.required}
              value={
                hasPendingFile ? '' : asString(form.getValues()[field.name])
              }
              onChangeAction={(value) => {
                form.setValues((currentValues) => ({
                  ...currentValues,
                  [field.name]: value,
                }));
                form.clearFieldError(field.name);
              }}
              pendingFile={hasPendingFile ? pendingFiles[field.name] : null}
              onPendingFileChangeAction={(file) => {
                setPendingFiles((prev) => ({...prev, [field.name]: file}));

                if (!file) {
                  return;
                }

                form.setValues((currentValues) => ({
                  ...currentValues,
                  [field.name]: file.name,
                }));
                form.clearFieldError(field.name);
              }}
              error={typeof fieldError === 'string' ? fieldError : undefined}
              disabled={isSaving}
            />
          );
        }

        if (field.type === 'custom') {
          return (
            <Group key={field.name} grow>
              {field.render({
                values: form.getValues(),
                setFieldValue,
                isSaving,
              })}
            </Group>
          );
        }

        return null;
      })}
    </Modal>
  );
}
