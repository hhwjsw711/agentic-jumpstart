ALTER TABLE "app_app_setting" DROP CONSTRAINT "app_app_setting_updatedBy_app_user_id_fk";
--> statement-breakpoint
ALTER TABLE "app_app_setting" DROP COLUMN "updatedBy";