CREATE TABLE "albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"release_date" date NOT NULL,
	"description" text,
	"genre" text,
	"label" text,
	"cover_image" text,
	"booklet_images" jsonb,
	"order" integer DEFAULT 0,
	"produced_by" text,
	"mixed_by" text,
	"recorded_by" text,
	"youtube_link" text,
	"spotify_link" text,
	"apple_music_link" text,
	"tidal_link" text,
	"tracks" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "albums_release_date_idx" ON "albums" USING btree ("release_date");--> statement-breakpoint
CREATE UNIQUE INDEX "albums_title_release_date_uidx" ON "albums" USING btree ("title","release_date");--> statement-breakpoint
CREATE INDEX "albums_archived_at_idx" ON "albums" USING btree ("archived_at");