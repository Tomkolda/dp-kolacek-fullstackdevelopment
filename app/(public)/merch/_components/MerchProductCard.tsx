'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  CardSection,
  Group,
  Image,
  NativeSelect,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconShoppingCartPlus,
} from '@tabler/icons-react';
import {useCallback, useEffect, useRef, useState} from 'react';

import {useCart} from '@/components/merch/CartProvider';
import type {MerchAvailability, MerchCategory} from '@/db/types';
import type {MerchProductListItem} from '@/lib/server/getMerchProducts';

import classes from './MerchProductCard.module.css';

type MerchProductCardProps = {
  product: MerchProductListItem;
};

type VariantDisplayRow = {
  index: number;
  label: string;
  priceCzk: number;
  availability: MerchAvailability;
};

function formatPrice(priceCzk: number): string {
  return `${priceCzk.toLocaleString('cs-CZ')} Kč`;
}

function flattenVariants(
  variants: MerchProductListItem['variants'],
  category: MerchCategory,
): VariantDisplayRow[] {
  const arr = variants as Array<Record<string, unknown>>;
  if (!Array.isArray(arr)) return [];

  return arr.map((v, index) => {
    let label: string;
    switch (category) {
      case 'music_release': {
        const format = (v as {format?: string}).format?.toUpperCase() ?? '';
        const edition = (v as {edition?: string}).edition;
        label = edition ? `${format} — ${edition}` : format;
        break;
      }
      case 'tshirt':
      case 'hoodie': {
        const size = (v as {size?: string}).size ?? '';
        const color = (v as {color?: string}).color ?? '';
        const fit = (v as {fit?: string}).fit;
        label = [size, color, fit].filter(Boolean).join(' / ');
        break;
      }
      case 'accessory': {
        label = (v as {label?: string}).label ?? '';
        break;
      }
      default:
        label = '';
    }

    return {
      index,
      label,
      priceCzk: (v as {priceCzk: number}).priceCzk,
      availability: (v as {availability: MerchAvailability}).availability,
    };
  });
}

function getUniqueImages(product: MerchProductListItem) {
  const seen = new Set<string>();
  const result: Array<{url: string; alt: string}> = [];

  if (product.coverImageUrl) {
    seen.add(product.coverImageUrl);
    result.push({url: product.coverImageUrl, alt: product.title});
  }

  for (const img of product.images) {
    if (!seen.has(img.url)) {
      seen.add(img.url);
      result.push({url: img.url, alt: img.altText ?? product.title});
    }
  }

  return result;
}

function getOverallAvailability(
  rows: VariantDisplayRow[],
): MerchAvailability | null {
  if (rows.length === 0) return null;
  if (rows.every((r) => r.availability === 'sold_out')) return 'sold_out';
  return null;
}

function isAvailable(availability: MerchAvailability): boolean {
  return availability !== 'sold_out' && availability !== 'unavailable';
}

export function MerchProductCard({product}: MerchProductCardProps) {
  const {addItem} = useCart();
  const variantRows = flattenVariants(product.variants, product.category);
  const images = getUniqueImages(product);
  const hasMultipleImages = images.length > 1;
  const overallAvailability = getOverallAvailability(variantRows);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(() => {
    const first = variantRows.find((r) => isAvailable(r.availability));
    return first?.index ?? variantRows[0]?.index ?? 0;
  });
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const prev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrentIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  const currentImage = images[currentIndex];
  const activeVariant = variantRows.find((r) => r.index === selectedVariant);
  const canAdd = activeVariant
    ? isAvailable(activeVariant.availability)
    : false;
  const hasMultipleVariants = variantRows.length > 1;
  const availableVariants = variantRows.filter((r) =>
    isAvailable(r.availability),
  );

  const handleAdd = useCallback(() => {
    if (!activeVariant || !canAdd) return;
    addItem({
      productId: product.id,
      productTitle: product.title,
      variantIndex: activeVariant.index,
      variantLabel: activeVariant.label || product.title,
      priceCzk: activeVariant.priceCzk,
      coverImageUrl: product.coverImageUrl,
    });
    setJustAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 1500);
  }, [activeVariant, canAdd, addItem, product]);

  return (
    <Card withBorder h="100%" radius="xl" className={classes.card}>
      <CardSection className={classes.mediaSection}>
        {currentImage ? (
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            h={280}
            fit="contain"
            className={classes.coverImage}
            fallbackSrc="https://placehold.co/600x600?text=Merch"
          />
        ) : (
          <Box h={280} className={classes.coverFallback}>
            <Text c="dimmed" size="sm">
              Bez obrázku
            </Text>
          </Box>
        )}

        {hasMultipleImages && (
          <>
            <ActionIcon
              variant="filled"
              color="dark"
              size="sm"
              radius="xl"
              className={classes.navPrev}
              onClick={prev}
              aria-label="Předchozí obrázek">
              <IconChevronLeft size={14} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="dark"
              size="sm"
              radius="xl"
              className={classes.navNext}
              onClick={next}
              aria-label="Další obrázek">
              <IconChevronRight size={14} />
            </ActionIcon>

            <Group gap={4} className={classes.dots}>
              {images.map((_, i) => (
                <Box
                  key={i}
                  className={classes.dot}
                  data-active={i === currentIndex || undefined}
                />
              ))}
            </Group>
          </>
        )}

        {overallAvailability === 'sold_out' && (
          <Badge
            variant="filled"
            color="red"
            radius="xl"
            className={classes.badge}>
            Vyprodáno
          </Badge>
        )}
      </CardSection>

      <Stack gap={6} className={classes.cardBody}>
        <Text fw={600} size="md" lineClamp={2}>
          {product.title}
        </Text>

        {product.description && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {product.description}
          </Text>
        )}

        {activeVariant && !hasMultipleVariants && activeVariant.label && (
          <Text size="xs" c="dimmed">
            {activeVariant.label}
          </Text>
        )}

        {activeVariant && (
          <Text size="sm" fw={600}>
            {isAvailable(activeVariant.availability)
              ? `– ${formatPrice(activeVariant.priceCzk)} –`
              : '– vyprodáno –'}
          </Text>
        )}

        {hasMultipleVariants && availableVariants.length > 0 && (
          <NativeSelect
            size="xs"
            value={String(selectedVariant)}
            onChange={(e) => setSelectedVariant(Number(e.currentTarget.value))}
            data={variantRows.map((r) => ({
              value: String(r.index),
              label: isAvailable(r.availability)
                ? `${r.label} — ${formatPrice(r.priceCzk)}`
                : `${r.label} — vyprodáno`,
              disabled: !isAvailable(r.availability),
            }))}
          />
        )}

        {availableVariants.length > 0 && (
          <Button
            size="xs"
            radius="xl"
            fullWidth
            disabled={!canAdd}
            color={justAdded ? 'green' : undefined}
            leftSection={
              justAdded ? (
                <IconCheck size={14} />
              ) : (
                <IconShoppingCartPlus size={14} />
              )
            }
            onClick={handleAdd}>
            {justAdded ? 'Přidáno' : 'Do košíku'}
          </Button>
        )}
      </Stack>
    </Card>
  );
}
