'use client';

import {FastAverageColor} from 'fast-average-color';
import {useEffect, useState} from 'react';

import type {AlbumDetail} from '@/db/schema';
import type {GetAlbumDetailActionFn} from '@/lib/server/getAlbums';
import {getImageUrl} from '@/lib/utils/getImageUrl';

export function useAlbumDetail(
  albumId: number,
  getAlbumDetailAction: GetAlbumDetailActionFn,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detail, setDetail] = useState<AlbumDetail | null>(null);
  const [dominantColor, setDominantColor] = useState<string | null>(null);

  useEffect(() => {
    if (!detail?.coverImage) return;

    let ignored = false;
    const fac = new FastAverageColor();
    const url = getImageUrl('albums', detail.coverImage);

    fac
      .getColorAsync(url, {crossOrigin: 'anonymous'})
      .then((color) => {
        if (!ignored) setDominantColor(color.hex);
      })
      .catch(() => {});

    return () => {
      ignored = true;
      fac.destroy();
    };
  }, [detail?.coverImage]);

  async function open() {
    setIsOpen(true);
    setErrorMessage(null);
    if (detail) return;

    setIsLoading(true);
    try {
      const response = await getAlbumDetailAction(albumId);
      if (!response.ok) {
        setErrorMessage(response.error);
        return;
      }
      setDetail(response.album);
    } catch {
      setErrorMessage('Nepodařilo se načíst detail alba.');
    } finally {
      setIsLoading(false);
    }
  }

  function close() {
    setIsOpen(false);
  }

  return {isOpen, isLoading, errorMessage, detail, dominantColor, open, close};
}
