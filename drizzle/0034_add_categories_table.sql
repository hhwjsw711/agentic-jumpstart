-- Create launch kit categories table
CREATE TABLE IF NOT EXISTS "app_launch_kit_category" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE,
  "slug" VARCHAR(50) NOT NULL UNIQUE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS "launch_kit_categories_slug_idx" ON "app_launch_kit_category" ("slug");

-- Add category_id column to tags table
ALTER TABLE "app_launch_kit_tag" ADD COLUMN "category_id" INTEGER;

-- Add foreign key constraint
ALTER TABLE "app_launch_kit_tag" ADD CONSTRAINT "app_launch_kit_tag_category_id_fkey" 
  FOREIGN KEY ("category_id") REFERENCES "app_launch_kit_category"("id") ON DELETE CASCADE;

-- Create index for category_id
CREATE INDEX IF NOT EXISTS "launch_kit_tags_category_idx" ON "app_launch_kit_tag" ("category_id");

-- Add updated_at column to tags table
ALTER TABLE "app_launch_kit_tag" ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL;

-- Migrate existing category data to the new table
INSERT INTO "app_launch_kit_category" (name, slug)
SELECT DISTINCT 
  CASE 
    WHEN category = 'framework' THEN 'Framework'
    WHEN category = 'language' THEN 'Language'
    WHEN category = 'database' THEN 'Database'
    WHEN category = 'tool' THEN 'Tool'
    WHEN category = 'deployment' THEN 'Deployment'
    WHEN category = 'other' THEN 'Other'
    ELSE INITCAP(category)
  END as name,
  category as slug
FROM "app_launch_kit_tag"
WHERE category IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update tags to reference the new categories
UPDATE "app_launch_kit_tag" t
SET category_id = c.id
FROM "app_launch_kit_category" c
WHERE t.category = c.slug;

-- Drop the old category column
ALTER TABLE "app_launch_kit_tag" DROP COLUMN IF EXISTS "category";