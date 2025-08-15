CREATE INDEX "attachments_segment_created_idx" ON "app_attachment" USING btree ("segmentId","created_at");--> statement-breakpoint
CREATE INDEX "comments_segment_created_idx" ON "app_comment" USING btree ("segmentId","created_at");--> statement-breakpoint
CREATE INDEX "comments_user_created_idx" ON "app_comment" USING btree ("userId","created_at");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "app_comment" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "comments_replied_to_idx" ON "app_comment" USING btree ("repliedToId");--> statement-breakpoint
CREATE INDEX "modules_order_idx" ON "app_module" USING btree ("order");--> statement-breakpoint
CREATE INDEX "segments_module_order_idx" ON "app_segment" USING btree ("moduleId","order");--> statement-breakpoint
CREATE INDEX "testimonials_created_idx" ON "app_testimonial" USING btree ("created_at");