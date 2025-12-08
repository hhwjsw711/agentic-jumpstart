ALTER TABLE "app_launch_kit_analytics" ALTER COLUMN "launch_kit_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "app_launch_kit_analytics" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "app_launch_kit_analytics" ALTER COLUMN "user_id" DROP NOT NULL;