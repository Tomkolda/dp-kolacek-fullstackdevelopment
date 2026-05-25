import type {MerchAvailability, MerchCategory} from '@/db/types';

export const MERCH_CATEGORY_LABELS: Record<MerchCategory, string> = {
  music_release: 'Hudební release',
  tshirt: 'Tričko',
  hoodie: 'Mikina',
  accessory: 'Doplněk',
};

export const MERCH_AVAILABILITY_LABELS: Record<MerchAvailability, string> = {
  in_stock: 'Skladem',
  sold_out: 'Vyprodáno',
  unavailable: 'Nedostupné',
  on_request: 'Na vyžádání',
  coming_soon: 'Připravujeme',
};

export const MERCH_AVAILABILITY_COLORS: Record<MerchAvailability, string> = {
  in_stock: 'green',
  sold_out: 'red',
  unavailable: 'gray',
  on_request: 'yellow',
  coming_soon: 'blue',
};
