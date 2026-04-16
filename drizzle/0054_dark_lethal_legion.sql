CREATE TABLE "app_purchase" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"stripeSessionId" text NOT NULL,
	"stripePaymentIntentId" text,
	"amountSubtotal" integer NOT NULL,
	"amountTotal" integer NOT NULL,
	"amountDiscount" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"customerEmail" text,
	"productName" text NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_purchase" ADD CONSTRAINT "app_purchase_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_stripe_session_unique" ON "app_purchase" USING btree ("stripeSessionId");--> statement-breakpoint
CREATE INDEX "purchases_user_created_idx" ON "app_purchase" USING btree ("userId","purchased_at");