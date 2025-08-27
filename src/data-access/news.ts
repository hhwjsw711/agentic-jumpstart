import { database } from "~/db";
import {
  newsEntries,
  newsTags,
  newsEntryTags,
  users,
  profiles,
} from "~/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import type {
  NewsEntry,
  NewsEntryCreate,
  NewsTag,
  NewsTagCreate,
} from "~/db/schema";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// News Entries
export async function getPublishedNewsEntries() {
  return database
    .select({
      id: newsEntries.id,
      title: newsEntries.title,
      description: newsEntries.description,
      url: newsEntries.url,
      type: newsEntries.type,
      imageUrl: newsEntries.imageUrl,
      publishedAt: newsEntries.publishedAt,
      createdAt: newsEntries.createdAt,
      authorName: profiles.displayName,
    })
    .from(newsEntries)
    .leftJoin(users, eq(newsEntries.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(newsEntries.isPublished, true))
    .orderBy(desc(newsEntries.publishedAt));
}

export async function getNewsEntriesWithTags() {
  const entries = await database
    .select({
      id: newsEntries.id,
      title: newsEntries.title,
      description: newsEntries.description,
      url: newsEntries.url,
      type: newsEntries.type,
      imageUrl: newsEntries.imageUrl,
      publishedAt: newsEntries.publishedAt,
      isPublished: newsEntries.isPublished,
      createdAt: newsEntries.createdAt,
      updatedAt: newsEntries.updatedAt,
      authorName: profiles.displayName,
    })
    .from(newsEntries)
    .leftJoin(users, eq(newsEntries.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(newsEntries.createdAt));

  // Get tags for each entry
  const entriesWithTags = await Promise.all(
    entries.map(async (entry) => {
      const tags = await database
        .select({
          id: newsTags.id,
          name: newsTags.name,
          slug: newsTags.slug,
          color: newsTags.color,
        })
        .from(newsTags)
        .innerJoin(newsEntryTags, eq(newsTags.id, newsEntryTags.newsTagId))
        .where(eq(newsEntryTags.newsEntryId, entry.id));

      return {
        ...entry,
        tags,
      };
    })
  );

  return entriesWithTags;
}

export async function getNewsEntryById(id: number) {
  const result = await database
    .select({
      id: newsEntries.id,
      title: newsEntries.title,
      description: newsEntries.description,
      url: newsEntries.url,
      type: newsEntries.type,
      imageUrl: newsEntries.imageUrl,
      publishedAt: newsEntries.publishedAt,
      isPublished: newsEntries.isPublished,
      createdAt: newsEntries.createdAt,
      updatedAt: newsEntries.updatedAt,
      authorId: newsEntries.authorId,
      authorName: profiles.displayName,
    })
    .from(newsEntries)
    .leftJoin(users, eq(newsEntries.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(newsEntries.id, id))
    .limit(1);

  if (!result[0]) return null;

  const tags = await database
    .select({
      id: newsTags.id,
      name: newsTags.name,
      slug: newsTags.slug,
      color: newsTags.color,
    })
    .from(newsTags)
    .innerJoin(newsEntryTags, eq(newsTags.id, newsEntryTags.newsTagId))
    .where(eq(newsEntryTags.newsEntryId, id));

  return {
    ...result[0],
    tags,
  };
}

export async function createNewsEntry(data: NewsEntryCreate) {
  const result = await database
    .insert(newsEntries)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  return result[0];
}

export async function updateNewsEntry(
  id: number,
  data: Partial<Omit<NewsEntryCreate, "id">>
) {
  const result = await database
    .update(newsEntries)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(newsEntries.id, id))
    .returning();
  return result[0];
}

export async function deleteNewsEntry(id: number) {
  // Delete related tags first (cascade should handle this, but being explicit)
  await database.delete(newsEntryTags).where(eq(newsEntryTags.newsEntryId, id));

  const result = await database
    .delete(newsEntries)
    .where(eq(newsEntries.id, id))
    .returning();
  return result[0];
}

// News Tags
export async function getAllNewsTags() {
  return database.select().from(newsTags).orderBy(newsTags.name);
}

export async function getNewsTagBySlug(slug: string) {
  const result = await database
    .select()
    .from(newsTags)
    .where(eq(newsTags.slug, slug))
    .limit(1);
  return result[0];
}

export async function createNewsTag(
  data: Omit<NewsTagCreate, "slug"> & { name: string }
) {
  const slug = generateSlug(data.name);
  const result = await database
    .insert(newsTags)
    .values({
      ...data,
      slug,
    })
    .returning();
  return result[0];
}

export async function updateNewsTag(
  id: number,
  data: Partial<Omit<NewsTagCreate, "id">>
) {
  const updateData: any = { ...data };

  if (data.name) {
    updateData.slug = generateSlug(data.name);
  }

  const result = await database
    .update(newsTags)
    .set(updateData)
    .where(eq(newsTags.id, id))
    .returning();
  return result[0];
}

export async function deleteNewsTag(id: number) {
  // Delete related entries first
  await database.delete(newsEntryTags).where(eq(newsEntryTags.newsTagId, id));

  const result = await database
    .delete(newsTags)
    .where(eq(newsTags.id, id))
    .returning();
  return result[0];
}

// News Entry Tags (many-to-many relationship)
export async function addTagToNewsEntry(
  newsEntryId: number,
  newsTagId: number
) {
  const result = await database
    .insert(newsEntryTags)
    .values({
      newsEntryId,
      newsTagId,
    })
    .returning();
  return result[0];
}

export async function removeTagFromNewsEntry(
  newsEntryId: number,
  newsTagId: number
) {
  const result = await database
    .delete(newsEntryTags)
    .where(
      and(
        eq(newsEntryTags.newsEntryId, newsEntryId),
        eq(newsEntryTags.newsTagId, newsTagId)
      )
    )
    .returning();
  return result[0];
}

export async function setNewsEntryTags(newsEntryId: number, tagIds: number[]) {
  // Remove all existing tags
  await database
    .delete(newsEntryTags)
    .where(eq(newsEntryTags.newsEntryId, newsEntryId));

  // Add new tags
  if (tagIds.length > 0) {
    await database.insert(newsEntryTags).values(
      tagIds.map((tagId) => ({
        newsEntryId,
        newsTagId: tagId,
      }))
    );
  }
}

export async function getNewsEntriesByTag(tagSlug: string) {
  return database
    .select({
      id: newsEntries.id,
      title: newsEntries.title,
      description: newsEntries.description,
      url: newsEntries.url,
      type: newsEntries.type,
      imageUrl: newsEntries.imageUrl,
      publishedAt: newsEntries.publishedAt,
      createdAt: newsEntries.createdAt,
      authorName: profiles.displayName,
    })
    .from(newsEntries)
    .innerJoin(newsEntryTags, eq(newsEntries.id, newsEntryTags.newsEntryId))
    .innerJoin(newsTags, eq(newsEntryTags.newsTagId, newsTags.id))
    .leftJoin(users, eq(newsEntries.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(newsTags.slug, tagSlug), eq(newsEntries.isPublished, true)))
    .orderBy(desc(newsEntries.publishedAt));
}
