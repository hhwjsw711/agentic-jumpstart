CREATE TABLE "app_launch_kit_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_launch_kit_category_name_unique" UNIQUE("name"),
	CONSTRAINT "app_launch_kit_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "launch_kit_tags_category_idx";--> statement-breakpoint
ALTER TABLE "app_launch_kit_tag" ADD COLUMN "category_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "app_launch_kit_tag" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "launch_kit_categories_slug_idx" ON "app_launch_kit_category" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "app_launch_kit_tag" ADD CONSTRAINT "app_launch_kit_tag_category_id_app_launch_kit_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."app_launch_kit_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "launch_kit_tags_category_idx" ON "app_launch_kit_tag" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "app_launch_kit_tag" DROP COLUMN "category";