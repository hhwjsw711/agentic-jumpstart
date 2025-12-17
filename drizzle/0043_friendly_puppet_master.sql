ALTER TABLE "app_unsubscribe_token" ALTER COLUMN "userId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "app_unsubscribe_token" ALTER COLUMN "userId" DROP NOT NULL;