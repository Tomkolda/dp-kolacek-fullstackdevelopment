DROP INDEX "gigs_title_date_place_uidx";--> statement-breakpoint
ALTER TABLE "gigs" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gigs" ADD COLUMN "city" text;--> statement-breakpoint
UPDATE "gigs"
SET
	"city" = CASE
		WHEN position(',' in "location") > 0 THEN NULLIF(trim(substring("location" from position(',' in "location") + 1)), '')
		ELSE NULLIF(trim("location"), '')
	END,
	"location" = CASE
		WHEN position(',' in "location") > 0 THEN NULLIF(trim(split_part("location", ',', 1)), '')
		ELSE NULL
	END;--> statement-breakpoint
ALTER TABLE "gigs" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "gigs_title_date_place_uidx" ON "gigs" USING btree ("title","date","city","location") WHERE "location" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "gigs_title_date_city_null_location_uidx" ON "gigs" USING btree ("title","date","city") WHERE "location" IS NULL;