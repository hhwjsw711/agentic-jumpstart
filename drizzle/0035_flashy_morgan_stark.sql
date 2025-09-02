CREATE TABLE "app_news_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"image_url" text,
	"published_at" timestamp NOT NULL,
	"author_id" serial NOT NULL,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_news_entry_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_entry_id" serial NOT NULL,
	"news_tag_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_news_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_news_tag_name_unique" UNIQUE("name"),
	CONSTRAINT "app_news_tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "app_news_entry" ADD CONSTRAINT "app_news_entry_author_id_app_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_news_entry_tag" ADD CONSTRAINT "app_news_entry_tag_news_entry_id_app_news_entry_id_fk" FOREIGN KEY ("news_entry_id") REFERENCES "public"."app_news_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_news_entry_tag" ADD CONSTRAINT "app_news_entry_tag_news_tag_id_app_news_tag_id_fk" FOREIGN KEY ("news_tag_id") REFERENCES "public"."app_news_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "news_entries_author_idx" ON "app_news_entry" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "news_entries_type_idx" ON "app_news_entry" USING btree ("type");--> statement-breakpoint
CREATE INDEX "news_entries_published_idx" ON "app_news_entry" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "news_entries_published_at_idx" ON "app_news_entry" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "news_entry_tags_entry_idx" ON "app_news_entry_tag" USING btree ("news_entry_id");--> statement-breakpoint
CREATE INDEX "news_entry_tags_tag_idx" ON "app_news_entry_tag" USING btree ("news_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "news_entry_tags_unique" ON "app_news_entry_tag" USING btree ("news_entry_id","news_tag_id");--> statement-breakpoint
CREATE INDEX "news_tags_slug_idx" ON "app_news_tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_tags_name_idx" ON "app_news_tag" USING btree ("name");