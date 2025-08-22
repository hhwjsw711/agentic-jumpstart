CREATE TABLE "app_email_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"updatedBy" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_email_template_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "app_email_template" ADD CONSTRAINT "app_email_template_updatedBy_app_user_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_templates_key_idx" ON "app_email_template" USING btree ("key");--> statement-breakpoint
CREATE INDEX "email_templates_active_idx" ON "app_email_template" USING btree ("isActive");