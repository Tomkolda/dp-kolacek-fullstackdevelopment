CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"street" text,
	"city" text,
	"postal_code" text,
	"delivery_method" text NOT NULL,
	"pickup_location" text,
	"status" text DEFAULT 'new' NOT NULL,
	"status_log" jsonb,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_log" jsonb,
	"items" jsonb NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	CONSTRAINT "orders_delivery_method_chk" CHECK ("orders"."delivery_method" IN ('address', 'in_person', 'box', 'pickup_point')),
	CONSTRAINT "orders_status_chk" CHECK ("orders"."status" IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
	CONSTRAINT "orders_payment_status_chk" CHECK ("orders"."payment_status" IN ('pending', 'paid', 'refunded'))
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");