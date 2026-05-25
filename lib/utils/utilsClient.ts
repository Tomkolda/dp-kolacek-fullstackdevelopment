import {type ClassValue, clsx} from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Formats a price value to CZK or returns a fallback label. */
export function formatPrice(price: number | null): string {
  if (price === null) return '';
  if (price === 0) return '';
  return `${price} Kč`;
}
