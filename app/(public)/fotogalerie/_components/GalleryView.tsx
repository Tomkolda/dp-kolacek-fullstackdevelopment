'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';

import type {
  GalleryListItem,
  GalleryPhoto,
  GetGalleryPhotosActionFn,
} from '@/lib/server/getGalleries';
import {formatDate} from '@/lib/utils/datetime';

import {GalleryCard} from './GalleryCard';
import {GalleryLightbox} from './GalleryLightbox';

type GalleryViewProps = {
  gallery: GalleryListItem;
  getGalleryPhotosAction: GetGalleryPhotosActionFn;
  defaultOpen?: boolean;
};

export function GalleryView({
  gallery,
  getGalleryPhotosAction,
  defaultOpen = false,
}: GalleryViewProps) {
  const router = useRouter();
  const displayTitle = useMemo(() => {
    const formattedDate = formatDate(gallery.date, 'd. M. yyyy');
    return formattedDate
      ? `${formattedDate} – ${gallery.title}`
      : gallery.title;
  }, [gallery.title, gallery.date]);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchPhotos = useRef(async () => {
    setIsLoading(true);
    try {
      const result = await getGalleryPhotosAction(gallery.id);
      setPhotos(result);
    } catch {
      // silently handle — lightbox will show empty
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (defaultOpen) void fetchPhotos.current();
  }, [defaultOpen]);

  async function open() {
    setIsOpen(true);
    window.history.pushState(null, '', `/fotogalerie/${gallery.slug}`);
    await fetchPhotos.current();
  }

  function close() {
    setIsOpen(false);
    router.replace('/fotogalerie');
  }

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setIsOpen(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isOpen]);

  return (
    <>
      <GalleryCard
        title={displayTitle}
        coverImageUrl={gallery.coverImageUrl}
        loading={isLoading}
        onClick={() => void open()}
      />

      <GalleryLightbox
        photos={photos}
        opened={isOpen && !isLoading}
        onClose={close}
      />
    </>
  );
}
