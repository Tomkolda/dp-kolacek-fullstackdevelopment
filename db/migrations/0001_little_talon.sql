CREATE TABLE "link_redirector" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "link_redirector_path_idx" ON "link_redirector" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "link_redirector_path_uidx" ON "link_redirector" USING btree ("title");