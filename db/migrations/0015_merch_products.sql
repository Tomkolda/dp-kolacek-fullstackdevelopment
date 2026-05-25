CREATE TABLE "merch_product_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"order" integer DEFAULT 0,
	"caption" text
);
--> statement-breakpoint
ALTER TABLE "merch_product_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "merch_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"variants" jsonb NOT NULL,
	"description" text,
	"cover_file_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "merch_products_category_chk" CHECK ("merch_products"."category" IN ('music_release', 'tshirt', 'hoodie', 'accessory'))
);
--> statement-breakpoint
ALTER TABLE "merch_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "merch_product_files" ADD CONSTRAINT "merch_product_files_product_id_merch_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_product_files" ADD CONSTRAINT "merch_product_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_products" ADD CONSTRAINT "merch_products_cover_file_id_files_id_fk" FOREIGN KEY ("cover_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "merch_product_files_product_id_file_id_uidx" ON "merch_product_files" USING btree ("product_id","file_id");--> statement-breakpoint
CREATE INDEX "merch_product_files_product_id_idx" ON "merch_product_files" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "merch_product_files_file_id_idx" ON "merch_product_files" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "merch_products_category_idx" ON "merch_products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "merch_products_archived_at_idx" ON "merch_products" USING btree ("archived_at");