DROP TABLE "link_redirector";--> statement-breakpoint
CREATE TABLE "link_redirector" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"target" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);--> statement-breakpoint
DROP TABLE "gigs";--> statement-breakpoint
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
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "gigs_time_order_chk" CHECK ("gigs"."end_time" IS NULL OR "gigs"."start_time" IS NULL OR "gigs"."end_time" > "gigs"."start_time")
);--> statement-breakpoint
CREATE INDEX "gigs_date_idx" ON "gigs" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "gigs_title_date_place_uidx" ON "gigs" USING btree ("title","date","location");--> statement-breakpoint
CREATE INDEX "gigs_archived_at_idx" ON "gigs" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "link_redirector_archived_at_idx" ON "link_redirector" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "link_redirector_path_idx" ON "link_redirector" USING btree ("path");--> statement-breakpoint
CREATE UNIQUE INDEX "link_redirector_path_uidx" ON "link_redirector" USING btree ("path");