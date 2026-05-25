import {sql} from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import {
  BEACON_TYPES,
  type BeaconType,
  MERCH_CATEGORIES,
  type MerchCategory,
  type MerchVariantValue,
  ORDER_DELIVERY_METHODS,
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  type OrderDeliveryMethod,
  type OrderItem,
  type OrderPaymentLogEntry,
  type OrderPaymentStatus,
  type OrderStatus,
  type OrderStatusLogEntry,
  WEB_ITEM_KEYS,
  type WebItemKey,
  type WebItemValue,
} from './types';

export const gigs = pgTable(
  'gigs',
  {
    id: serial('id').primaryKey(),

    // required fields
    title: text('title').notNull(),
    city: text('city').notNull(),
    location: text('location'),
    date: date('date').notNull(),

    // optional fields
    description: text('description'),
    startTime: time('start_time'),
    endTime: time('end_time'),
    price: integer('price'),
    image: text('image'),
    mapLink: text('map_link'),
    facebookLink: text('facebook_link'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting/filtering by date
    index('gigs_date_idx').on(table.date),

    // protection against duplicates of the same event
    uniqueIndex('gigs_title_date_place_uidx')
      .on(table.title, table.date, table.city, table.location)
      .where(sql`${table.location} IS NOT NULL`),
    uniqueIndex('gigs_title_date_city_null_location_uidx')
      .on(table.title, table.date, table.city)
      .where(sql`${table.location} IS NULL`),

    // endTime must be after startTime (if both are filled)
    check(
      'gigs_time_order_chk',
      sql`${table.endTime} IS NULL OR ${table.startTime} IS NULL OR ${table.endTime} > ${table.startTime}`,
    ),

    // index for filtering archived records
    index('gigs_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();

export const linkRedirector = pgTable(
  'link_redirector',
  {
    id: serial('id').primaryKey(),

    // required fields
    path: text('path').notNull(),
    target: text('target').notNull(),
    title: text('title').notNull(),

    // optional fields
    description: text('description'),
    image: text('image'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting/filtering by path
    index('link_redirector_path_idx').on(table.path),

    // protection against duplicates of the same redirect
    uniqueIndex('link_redirector_path_uidx').on(table.path),

    // index for filtering archived records
    index('link_redirector_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();

export const sponsors = pgTable(
  'sponsors',
  {
    id: serial('id').primaryKey(),

    // required fields
    name: text('name').notNull(),
    image: text('image').notNull(),
    link: text('link').notNull(),

    // optional fields
    description: text('description'),
    order: integer('order').default(0),
    logoScale: real('logo_scale'),
    logoTranslateY: integer('logo_translate_y'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting/filtering by name
    uniqueIndex('sponsors_name_idx').on(table.name),
  ],
).enableRLS();

export const members = pgTable(
  'members',
  {
    id: serial('id').primaryKey(),

    // required fields
    name: text('name').notNull(),
    image: text('image').notNull(),
    instrument: text('instrument').notNull(),

    // optional fields
    location: text('location'),
    order: integer('order').default(0),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting/filtering by name
    uniqueIndex('members_name_idx').on(table.name),
  ],
).enableRLS();

export const profiles = pgTable(
  'profiles',
  {
    id: serial('id').primaryKey(),

    // required fields
    name: text('name').notNull(),
    icon: text('icon').notNull(),
    link: text('link').notNull(),

    // optional fields
    iconColor: text('icon_color'),
    description: text('description'),
    order: integer('order').default(0),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting/filtering by name
    uniqueIndex('profiles_name_idx').on(table.name),

    // index for filtering archived records
    index('profiles_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();

/** Track in an album tracklist (stored as JSONB within the album row). */
export type AlbumTrack = {
  trackNumber: number;
  title: string;
  durationSeconds?: number;
  musicBy?: string;
  lyricsBy?: string;
  featuring?: string;
  lyrics?: string;
  videoLink?: string;
  isrcCode?: string;
};

/** Read model used for album detail modal payloads. */
export type AlbumDetail = {
  id: number;
  title: string;
  releaseDate: string;
  description: string | null;
  genre: string | null;
  label: string | null;
  coverImage: string | null;
  bookletImages: string[] | null;
  producedBy: string | null;
  mixedBy: string | null;
  recordedBy: string | null;
  tracks: AlbumTrack[] | null;
};

export const albums = pgTable(
  'albums',
  {
    id: serial('id').primaryKey(),

    // required fields
    title: text('title').notNull(),
    releaseDate: date('release_date').notNull(),

    // optional fields — metadata
    description: text('description'),
    genre: text('genre'),
    label: text('label'),
    coverImage: text('cover_image'),
    bookletImages: jsonb('booklet_images').$type<string[]>(),
    order: integer('order').default(0),

    // optional fields — credits (per-track credits are in AlbumTrack)
    producedBy: text('produced_by'),
    mixedBy: text('mixed_by'),
    recordedBy: text('recorded_by'),

    // optional fields — streaming links
    youtubeLink: text('youtube_link'),
    spotifyLink: text('spotify_link'),
    appleMusicLink: text('apple_music_link'),
    tidalLink: text('tidal_link'),

    // tracklist (ordered array of tracks)
    tracks: jsonb('tracks').$type<AlbumTrack[]>(),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting by release date
    index('albums_release_date_idx').on(table.releaseDate),

    // protection against duplicate albums
    uniqueIndex('albums_title_release_date_uidx').on(
      table.title,
      table.releaseDate,
    ),

    // index for filtering archived records
    index('albums_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();

export const beacons = pgTable(
  'beacons',
  {
    id: serial('id').primaryKey(),

    // required fields
    slug: text('slug').notNull(),
    type: text('type').$type<BeaconType>().notNull(),
    releaseDate: date('release_date').notNull(),
    title: text('title').notNull(),
    youtubeLink: text('youtube_link').notNull(),

    // optional fields
    subtitle: text('subtitle'),
    description: text('description'),
    imageFileId: integer('image_file_id').references(() => files.id, {
      onDelete: 'set null',
    }),
    youtubeEmbedUrl: text('youtube_embed_url'),
    spotifyLink: text('spotify_link'),
    appleLink: text('apple_link'),
    tidalLink: text('tidal_link'),
    merchLink: text('merch_link'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // enforce only known beacon types at DB level
    check(
      'beacons_type_chk',
      sql`${table.type} IN (${sql.raw(BEACON_TYPES.map((t) => `'${t}'`).join(', '))})`,
    ),

    // slug must be unique
    uniqueIndex('beacons_slug_uidx').on(table.slug),

    // common sorting by release date
    index('beacons_release_date_idx').on(table.releaseDate),

    // filtering by type
    index('beacons_type_idx').on(table.type),

    // index for filtering archived records
    index('beacons_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();

export const platforms = pgTable(
  'platforms',
  {
    id: serial('id').primaryKey(),

    // required fields
    name: text('name').notNull(),
    image: text('image').notNull(),
    link: text('link').notNull(),

    // optional fields
    description: text('description'),
    order: integer('order').default(0),
    logoScale: real('logo_scale'),
    logoTranslateY: integer('logo_translate_y'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // common sorting/filtering by name
    uniqueIndex('platforms_name_idx').on(table.name),
  ],
).enableRLS();

/** Central registry for files stored in Supabase Storage (one row per object). */
export const files = pgTable(
  'files',
  {
    id: serial('id').primaryKey(),

    storageBucket: text('storage_bucket').notNull(),
    storagePath: text('storage_path').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    width: integer('width'),
    height: integer('height'),
    altText: text('alt_text'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
  },
  (table) => [
    uniqueIndex('files_storage_bucket_path_uidx').on(
      table.storageBucket,
      table.storagePath,
    ),
  ],
).enableRLS();

export const galleries = pgTable(
  'galleries',
  {
    id: serial('id').primaryKey(),

    // required fields
    title: text('title').notNull(),
    slug: text('slug').notNull(),

    // optional fields
    description: text('description'),
    coverFileId: integer('cover_file_id').references(() => files.id, {
      onDelete: 'set null',
    }),
    date: date('date'),
    order: integer('order').default(0),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [uniqueIndex('galleries_slug_uidx').on(table.slug)],
).enableRLS();

export const galleryFiles = pgTable(
  'gallery_files',
  {
    id: serial('id').primaryKey(),
    galleryId: integer('gallery_id')
      .notNull()
      .references(() => galleries.id, {onDelete: 'cascade'}),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, {onDelete: 'cascade'}),
    order: integer('order').default(0),
    caption: text('caption'),
  },
  (table) => [
    uniqueIndex('gallery_files_gallery_id_file_id_uidx').on(
      table.galleryId,
      table.fileId,
    ),
    index('gallery_files_gallery_id_idx').on(table.galleryId),
    index('gallery_files_file_id_idx').on(table.fileId),
  ],
).enableRLS();

export const merchProducts = pgTable(
  'merch_products',
  {
    id: serial('id').primaryKey(),

    // required fields
    title: text('title').notNull(),
    category: text('category').$type<MerchCategory>().notNull(),
    variants: jsonb('variants').$type<MerchVariantValue>().notNull(),

    // optional fields
    description: text('description'),
    coverFileId: integer('cover_file_id').references(() => files.id, {
      onDelete: 'set null',
    }),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // enforce only known merch categories at DB level
    check(
      'merch_products_category_chk',
      sql`${table.category} IN (${sql.raw(MERCH_CATEGORIES.map((category) => `'${category}'`).join(', '))})`,
    ),

    // common filtering by category
    index('merch_products_category_idx').on(table.category),

    // index for filtering archived records
    index('merch_products_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();

export const merchProductFiles = pgTable(
  'merch_product_files',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => merchProducts.id, {onDelete: 'cascade'}),
    fileId: integer('file_id')
      .notNull()
      .references(() => files.id, {onDelete: 'cascade'}),
    order: integer('order').default(0),
    caption: text('caption'),
  },
  (table) => [
    uniqueIndex('merch_product_files_product_id_file_id_uidx').on(
      table.productId,
      table.fileId,
    ),
    index('merch_product_files_product_id_idx').on(table.productId),
    index('merch_product_files_file_id_idx').on(table.fileId),
  ],
).enableRLS();

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),

    // customer info
    customerName: text('customer_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),

    // address
    street: text('street'),
    city: text('city'),
    postalCode: text('postal_code'),

    // delivery
    deliveryMethod: text('delivery_method')
      .$type<OrderDeliveryMethod>()
      .notNull(),
    pickupLocation: text('pickup_location'),

    // order status
    status: text('status').$type<OrderStatus>().notNull().default('new'),
    statusLog: jsonb('status_log').$type<OrderStatusLogEntry[]>(),

    // payment
    paymentStatus: text('payment_status')
      .$type<OrderPaymentStatus>()
      .notNull()
      .default('pending'),
    paymentLog: jsonb('payment_log').$type<OrderPaymentLogEntry[]>(),

    // items (jsonb for variant-specific data)
    items: jsonb('items').$type<OrderItem[]>().notNull(),

    note: text('note'),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(),
  },
  (table) => [
    check(
      'orders_delivery_method_chk',
      sql`${table.deliveryMethod} IN (${sql.raw(ORDER_DELIVERY_METHODS.map((m) => `'${m}'`).join(', '))})`,
    ),
    check(
      'orders_status_chk',
      sql`${table.status} IN (${sql.raw(ORDER_STATUSES.map((s) => `'${s}'`).join(', '))})`,
    ),
    check(
      'orders_payment_status_chk',
      sql`${table.paymentStatus} IN (${sql.raw(ORDER_PAYMENT_STATUSES.map((s) => `'${s}'`).join(', '))})`,
    ),

    index('orders_status_idx').on(table.status),
    index('orders_payment_status_idx').on(table.paymentStatus),
    index('orders_email_idx').on(table.email),
    index('orders_created_at_idx').on(table.createdAt),
  ],
).enableRLS();

export const webItems = pgTable(
  'web_items',
  {
    id: serial('id').primaryKey(),

    // required fields
    key: text('key').$type<WebItemKey>().notNull(),
    value: jsonb('value').$type<WebItemValue>().notNull(),

    // system fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: uuid('created_by').notNull(), // references auth.users(id)
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').notNull(), // references auth.users(id)
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    // enforce only known keys at DB level; update this when adding to WEB_ITEM_KEYS
    check(
      'web_items_key_chk',
      sql`${table.key} IN (${sql.raw(WEB_ITEM_KEYS.map((k) => `'${k}'`).join(', '))})`,
    ),

    // one active (non-archived) row per key
    uniqueIndex('web_items_key_active_uniq')
      .on(table.key)
      .where(sql`${table.archivedAt} IS NULL`),

    // fast lookup by key
    index('web_items_key_idx').on(table.key),

    // index for filtering archived records
    index('web_items_archived_at_idx').on(table.archivedAt),
  ],
).enableRLS();
