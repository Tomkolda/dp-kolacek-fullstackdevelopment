CREATE TABLE IF NOT EXISTS "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"link" text NOT NULL,
	"icon_color" text,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_name_idx" ON "profiles" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_archived_at_idx" ON "profiles" USING btree ("archived_at");
