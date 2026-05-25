-- Drop and recreate platforms table with new structure
DROP TABLE "platforms" CASCADE;--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"link" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_name_idx" ON "platforms" USING btree ("name");--> statement-breakpoint
-- Create sponsors table (replaces partner_logos)
CREATE TABLE "sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"link" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sponsors_name_idx" ON "sponsors" USING btree ("name");--> statement-breakpoint
-- Drop old partner_logos table
ALTER TABLE "partner_logos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "partner_logos" CASCADE;--> statement-breakpoint
-- Update gigs table: rename columns
ALTER TABLE "gigs" ADD COLUMN "map_link" text;--> statement-breakpoint
ALTER TABLE "gigs" ADD COLUMN "facebook_link" text;--> statement-breakpoint
ALTER TABLE "gigs" DROP COLUMN "map_url";--> statement-breakpoint
ALTER TABLE "gigs" DROP COLUMN "facebook_url";