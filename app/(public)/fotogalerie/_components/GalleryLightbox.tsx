'use client';

import {ActionIcon, Modal, Text} from '@mantine/core';
import {IconChevronLeft, IconChevronRight, IconX} from '@tabler/icons-react';
import {useCallback, useEffect, useRef, useState} from 'react';

import type {GalleryPhoto} from '@/lib/server/getGalleries';

import classes from './GalleryLightbox.module.css';

type GalleryLightboxProps = {
  photos: GalleryPhoto[];
  opened: boolean;
  initialIndex?: number;
  onClose: () => void;
};

export function GalleryLightbox({
  photos,
  opened,
  initialIndex = 0,
  onClose,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (opened) setCurrentIndex(initialIndex);
  }, [opened, initialIndex]);

  const len = photos.length;

  const goNext = useCallback(() => {
    if (len <= 1) return;
    setCurrentIndex((i) => (i + 1) % len);
  }, [len]);

  const goPrev = useCallback(() => {
    if (len <= 1) return;
    setCurrentIndex((i) => (i - 1 + len) % len);
  }, [len]);

  useEffect(() => {
    if (!opened || len === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [opened, len, goNext, goPrev]);

  useEffect(() => {
    const strip = thumbnailStripRef.current;
    if (!strip) return;
    const thumb = strip.children[currentIndex] as HTMLElement | undefined;
    if (!thumb) return;
    const left =
      thumb.offsetLeft - strip.offsetWidth / 2 + thumb.offsetWidth / 2;
    strip.scrollTo({left, behavior: 'smooth'});
  }, [currentIndex]);

  if (photos.length === 0) return null;

  const current = photos[currentIndex];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      title=""
      aria-label="Fotogalerie"
      classNames={{
        inner: classes.modalInner,
        content: classes.modalContent,
        header: classes.modalHeader,
        body: classes.modalBody,
      }}>
      <div className={classes.viewport}>
        <ActionIcon
          variant="subtle"
          size="lg"
          radius="xl"
          aria-label="Zavřít galerii"
          className={classes.closeButton}
          onClick={onClose}>
          <IconX size={20} stroke={2} />
        </ActionIcon>

        <div className={classes.mainArea}>
          {photos.length > 1 && (
            <ActionIcon
              variant="subtle"
              size="xl"
              radius="xl"
              aria-label="Předchozí fotka"
              className={`${classes.navArrow} ${classes.navArrowLeft}`}
              onClick={goPrev}>
              <IconChevronLeft size={28} stroke={2} />
            </ActionIcon>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={
              current.altText ?? current.caption ?? `Fotka ${currentIndex + 1}`
            }
            className={classes.mainImage}
          />

          {photos.length > 1 && (
            <ActionIcon
              variant="subtle"
              size="xl"
              radius="xl"
              aria-label="Další fotka"
              className={`${classes.navArrow} ${classes.navArrowRight}`}
              onClick={goNext}>
              <IconChevronRight size={28} stroke={2} />
            </ActionIcon>
          )}
        </div>

        {current.caption && (
          <Text size="sm" className={classes.caption}>
            {current.caption}
          </Text>
        )}

        {photos.length > 1 && (
          <div className={classes.thumbnailStrip} ref={thumbnailStripRef}>
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Fotka ${idx + 1}`}
                className={`${classes.thumbnail} ${idx === currentIndex ? classes.thumbnailActive : ''}`}
                onClick={() => setCurrentIndex(idx)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.altText ?? `Miniatura ${idx + 1}`}
                  className={classes.thumbnailImage}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
