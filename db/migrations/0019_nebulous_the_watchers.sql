CREATE TABLE "beacons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"release_date" date NOT NULL,
	"title" text NOT NULL,
	"youtube_link" text NOT NULL,
	"subtitle" text,
	"description" text,
	"image_file_id" integer,
	"youtube_embed_url" text,
	"spotify_link" text,
	"apple_link" text,
	"tidal_link" text,
	"merch_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "beacons_type_chk" CHECK ("beacons"."type" IN ('single', 'album', 'musicvideo'))
);
--> statement-breakpoint
ALTER TABLE "beacons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "beacons" ADD CONSTRAINT "beacons_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "beacons_slug_uidx" ON "beacons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "beacons_release_date_idx" ON "beacons" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "beacons_type_idx" ON "beacons" USING btree ("type");--> statement-breakpoint
CREATE INDEX "beacons_archived_at_idx" ON "beacons" USING btree ("archived_at");