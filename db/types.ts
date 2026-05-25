import {type InferSelectModel} from 'drizzle-orm';

import {
  type albums,
  type beacons,
  type files,
  type galleries,
  type gigs,
  type linkRedirector,
  type members,
  type merchProductFiles,
  type merchProducts,
  type orders,
  type platforms,
  type profiles,
  type sponsors,
} from './schema';

export type DBAlbum = InferSelectModel<typeof albums>;
export type DBBeacon = InferSelectModel<typeof beacons>;
export type DBFile = InferSelectModel<typeof files>;
export type DBGallery = InferSelectModel<typeof galleries>;
export type DBGig = InferSelectModel<typeof gigs>;
export type DBMember = InferSelectModel<typeof members>;
export type DBMerchProduct = InferSelectModel<typeof merchProducts>;
export type DBMerchProductFile = InferSelectModel<typeof merchProductFiles>;
export type DBOrder = InferSelectModel<typeof orders>;
export type DBPlatform = InferSelectModel<typeof platforms>;
export type DBProfile = InferSelectModel<typeof profiles>;
export type DBRedirect = InferSelectModel<typeof linkRedirector>;
export type DBSponsor = InferSelectModel<typeof sponsors>;

export const MERCH_CATEGORIES = [
  'music_release',
  'tshirt',
  'hoodie',
  'accessory',
] as const;

export type MerchCategory = (typeof MERCH_CATEGORIES)[number];

export const MERCH_AVAILABILITIES = [
  'in_stock',
  'sold_out',
  'unavailable',
  'on_request',
  'coming_soon',
] as const;

export type MerchAvailability = (typeof MERCH_AVAILABILITIES)[number];

export const MERCH_MUSIC_RELEASE_FORMATS = [
  'cd',
  'digital',
  'vinyl',
  'cassette',
] as const;

export type MerchMusicReleaseFormat =
  (typeof MERCH_MUSIC_RELEASE_FORMATS)[number];

export const MERCH_APPAREL_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
] as const;

export type MerchApparelSize = (typeof MERCH_APPAREL_SIZES)[number];

type BaseMerchVariant = {
  priceCzk: number;
  availability: MerchAvailability;
  notes?: string;
  sortOrder?: number;
  isDefault?: boolean;
};

export type MusicReleaseMerchVariant = BaseMerchVariant & {
  format: MerchMusicReleaseFormat;
  edition?: string;
};

export type TshirtMerchVariant = BaseMerchVariant & {
  color: string;
  size: MerchApparelSize;
  fit?: string;
};

export type HoodieMerchVariant = BaseMerchVariant & {
  color: string;
  size: MerchApparelSize;
  fit?: string;
};

export type AccessoryMerchVariant = BaseMerchVariant & {
  label: string;
};

export type MerchVariantValueByCategory = {
  music_release: MusicReleaseMerchVariant[];
  tshirt: TshirtMerchVariant[];
  hoodie: HoodieMerchVariant[];
  accessory: AccessoryMerchVariant[];
};

export type MerchVariantValue = MerchVariantValueByCategory[MerchCategory];

export type MerchVariantValueOf<C extends MerchCategory> =
  MerchVariantValueByCategory[C];

export const WEB_ITEM_KEYS = [
  'contact',
  'fb_news',
  'logo',
  'organizer_materials',
  'stats',
  'video_preview',
] as const;

export type WebItemKey = (typeof WEB_ITEM_KEYS)[number];

export type ContactWebItemValue = {
  type: 'contact';
  email: string | null;
  telephone: string | null;
};

export type FbNewsWebItemValue = {
  type: 'fb_news';
  visible: boolean;
  limit: number;
};

export type LogoWebItemValue = {
  type: 'logo';
  banner: string | null;
  text: string | null;
  circle: string | null;
  combined: string | null;
  textDark: string | null;
  circleDark: string | null;
  combinedDark: string | null;
};

export type OrganizerMaterialsWebItemValue = {
  type: 'organizer_materials';
  pressKit: string | null;
  logo: string | null;
  technicalRider: string | null;
  stagePlan: string | null;
};

export type StatsWebItemValue = {
  type: 'stats';
  foundedYear: number | null;
  albumCount: number | null;
  concertCount: number | null;
  clipCount: number | null;
};

export type VideoPreviewWebItemValue = {
  type: 'video_preview';
  videoUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
};

export type WebItemValue =
  | ContactWebItemValue
  | FbNewsWebItemValue
  | LogoWebItemValue
  | OrganizerMaterialsWebItemValue
  | StatsWebItemValue
  | VideoPreviewWebItemValue;

export type WebItemValueOf<K extends WebItemValue['type']> = Extract<
  WebItemValue,
  {type: K}
>;

// ── Beacons ─────────────────────────────────────────────────────────────────

export const BEACON_TYPES = ['single', 'album', 'musicvideo'] as const;

export type BeaconType = (typeof BEACON_TYPES)[number];

// ── Orders ──────────────────────────────────────────────────────────────────

export const ORDER_DELIVERY_METHODS = [
  'address',
  'in_person',
  'box',
  'pickup_point',
] as const;

export type OrderDeliveryMethod = (typeof ORDER_DELIVERY_METHODS)[number];

export const ORDER_STATUSES = [
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PAYMENT_STATUSES = ['pending', 'paid', 'refunded'] as const;

export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];

export type OrderItem = {
  productId: number;
  productTitle: string;
  variantLabel: string;
  priceCzk: number;
  quantity: number;
};

export type OrderStatusLogEntry = {
  status: OrderStatus;
  changedBy: string; // uuid
  changedAt: string; // ISO 8601
};

export type OrderPaymentLogEntry = {
  action: 'payment_confirmed' | 'payment_refunded' | 'payment_reset';
  performedBy: string; // uuid
  performedAt: string; // ISO 8601
};
