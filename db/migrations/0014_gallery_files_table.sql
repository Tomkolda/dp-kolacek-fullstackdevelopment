CREATE TABLE "gallery_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"gallery_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"order" integer DEFAULT 0,
	"caption" text
);
--> statement-breakpoint
ALTER TABLE "gallery_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gallery_files" ADD CONSTRAINT "gallery_files_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_files" ADD CONSTRAINT "gallery_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gallery_files_gallery_id_file_id_uidx" ON "gallery_files" USING btree ("gallery_id","file_id");--> statement-breakpoint
CREATE INDEX "gallery_files_gallery_id_idx" ON "gallery_files" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_files_file_id_idx" ON "gallery_files" USING btree ("file_id");