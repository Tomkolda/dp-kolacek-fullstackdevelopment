CREATE TABLE IF NOT EXISTS "web_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "web_items" ADD CONSTRAINT "web_items_key_chk" CHECK ("web_items"."key" IN ('contact', 'logo', 'organizer_materials', 'stats', 'video_preview'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "web_items_key_idx" ON "web_items" USING btree ("key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "web_items_archived_at_idx" ON "web_items" USING btree ("archived_at");
