CREATE TABLE "app_app_setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updatedBy" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_app_setting" ADD CONSTRAINT "app_app_setting_updatedBy_app_user_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_settings_key_idx" ON "app_app_setting" USING btree ("key");