'use client';

import {ActionIcon, TextInput, Tooltip} from '@mantine/core';
import {IconRefresh} from '@tabler/icons-react';
import {useCallback, useEffect, useRef} from 'react';

import {generateGallerySlug} from '@/lib/utils/slugify';

type GallerySlugFieldProps = {
  title: string;
  date: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChangeAction: (slug: string) => void;
};

export function GallerySlugField({
  title,
  date,
  value,
  error,
  disabled,
  onChangeAction,
}: GallerySlugFieldProps) {
  const isManualRef = useRef(false);
  const onChangeRef = useRef(onChangeAction);
  onChangeRef.current = onChangeAction;

  const autoSlug = generateGallerySlug(title, date);

  useEffect(() => {
    if (isManualRef.current) return;
    onChangeRef.current(autoSlug);
  }, [autoSlug]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    isManualRef.current = true;
    onChangeRef.current(e.currentTarget.value);
  }, []);

  const handleReset = useCallback(() => {
    isManualRef.current = false;
    onChangeRef.current(autoSlug);
  }, [autoSlug]);

  return (
    <TextInput
      label="Slug"
      placeholder="automaticky-z-nazvu-a-datumu"
      withAsterisk
      value={value}
      onChange={handleChange}
      error={error}
      disabled={disabled}
      rightSection={
        isManualRef.current ? (
          <Tooltip label="Obnovit automatický slug">
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label="Obnovit automatický slug"
              onClick={handleReset}
              disabled={disabled}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        ) : null
      }
    />
  );
}
