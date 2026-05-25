'use client';

import {
  Alert,
  Button,
  Group,
  Modal as MantineModal,
  Stack,
} from '@mantine/core';
import type {FormHTMLAttributes, ReactNode} from 'react';

import classes from './Modal.module.css';

type ModalProps = {
  opened: boolean;
  onClose: () => void;
  title: string;
  submitLabel?: string;
  size?: string;
  children: ReactNode;
  isSaving: boolean;
  error: string | null;
  onFormSubmit: FormHTMLAttributes<HTMLFormElement>['onSubmit'];
};

export function Modal({
  opened,
  onClose,
  title,
  submitLabel = 'Uložit',
  size = 'lg',
  children,
  isSaving,
  error,
  onFormSubmit,
}: ModalProps) {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnClickOutside={!isSaving}
      closeOnEscape={!isSaving}>
      <form onSubmit={onFormSubmit}>
        <Stack gap="md">
          {error ? (
            <Alert color="red" title="Chyba">
              {error}
            </Alert>
          ) : null}

          {children}

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={isSaving}>
              Zrušit
            </Button>
            <Button
              type="submit"
              className={classes.submitButton}
              loading={isSaving}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </MantineModal>
  );
}
