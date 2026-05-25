CREATE TABLE "gigs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"date" date NOT NULL,
	"description" text,
	"start_time" time,
	"end_time" time,
	"price" integer,
	"image" text,
	"map_url" text,
	"facebook_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "gigs_time_order_chk" CHECK ("gigs"."end_time" IS NULL OR "gigs"."start_time" IS NULL OR "gigs"."end_time" > "gigs"."start_time")
);
--> statement-breakpoint
CREATE INDEX "gigs_date_idx" ON "gigs" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "gigs_title_date_place_uidx" ON "gigs" USING btree ("title","date","location");