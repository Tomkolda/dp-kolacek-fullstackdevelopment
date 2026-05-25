CREATE TABLE "galleries" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"cover_file_id" integer,
	"date" date,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "galleries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_cover_file_id_files_id_fk" FOREIGN KEY ("cover_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "galleries_slug_uidx" ON "galleries" USING btree ("slug");