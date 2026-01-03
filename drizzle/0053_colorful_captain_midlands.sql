CREATE TABLE "app_video_download" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"segmentId" integer NOT NULL,
	"ipAddressHash" text,
	"userAgent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_video_download" ADD CONSTRAINT "app_video_download_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_video_download" ADD CONSTRAINT "app_video_download_segmentId_app_segment_id_fk" FOREIGN KEY ("segmentId") REFERENCES "public"."app_segment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "video_downloads_user_idx" ON "app_video_download" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "video_downloads_segment_idx" ON "app_video_download" USING btree ("segmentId");--> statement-breakpoint
CREATE INDEX "video_downloads_created_idx" ON "app_video_download" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "video_downloads_user_segment_idx" ON "app_video_download" USING btree ("userId","segmentId");