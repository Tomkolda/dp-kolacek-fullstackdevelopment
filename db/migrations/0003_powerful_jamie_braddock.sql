CREATE TABLE "partner_logos" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_path" text NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_path" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "partner_logos_name_idx" ON "partner_logos" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_name_idx" ON "platforms" USING btree ("name");