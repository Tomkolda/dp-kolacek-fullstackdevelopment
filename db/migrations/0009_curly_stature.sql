ALTER TABLE "platforms" ADD COLUMN IF NOT EXISTS "logo_scale" real;--> statement-breakpoint
ALTER TABLE "platforms" ADD COLUMN IF NOT EXISTS "logo_translate_y" integer;--> statement-breakpoint
ALTER TABLE "sponsors" ADD COLUMN IF NOT EXISTS "logo_scale" real;--> statement-breakpoint
ALTER TABLE "sponsors" ADD COLUMN IF NOT EXISTS "logo_translate_y" integer;