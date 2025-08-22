import {
  createNewsEntry,
  createNewsTag,
  deleteNewsEntry,
  deleteNewsTag,
  getAllNewsTags,
  getNewsEntriesWithTags,
  getNewsEntryById,
  getPublishedNewsEntries,
  setNewsEntryTags,
  updateNewsEntry,
  updateNewsTag,
} from "~/data-access/news";
import { PublicError } from "./errors";
import { UserId } from "./types";

export type CreateNewsEntryInput = {
  title: string;
  description?: string;
  url: string;
  type: "video" | "blog" | "changelog";
  imageUrl?: string;
  publishedAt: Date;
  isPublished?: boolean;
  tagIds?: number[];
};

export type UpdateNewsEntryInput = Partial<CreateNewsEntryInput>;

export type CreateNewsTagInput = {
  name: string;
  color?: string;
};

export type UpdateNewsTagInput = Partial<CreateNewsTagInput>;

// News Entries
export async function getPublishedNewsEntriesUseCase() {
  return getPublishedNewsEntries();
}

export async function getNewsEntriesWithTagsUseCase() {
  return getNewsEntriesWithTags();
}

export async function getNewsEntryByIdUseCase(id: number) {
  const entry = await getNewsEntryById(id);
  if (!entry) {
    throw new PublicError("News entry not found");
  }
  return entry;
}

export async function createNewsEntryUseCase(
  adminId: UserId,
  data: CreateNewsEntryInput
) {
  // Validate title
  if (!data.title || data.title.length < 3) {
    throw new PublicError("Title must be at least 3 characters");
  }

  // Validate URL
  if (!data.url || !isValidUrl(data.url)) {
    throw new PublicError("Valid URL is required");
  }

  // Validate type
  if (!["video", "blog", "changelog"].includes(data.type)) {
    throw new PublicError("Invalid news entry type");
  }

  // Validate published date
  if (!data.publishedAt) {
    throw new PublicError("Published date is required");
  }

  // Create the news entry
  const newsEntry = await createNewsEntry({
    title: data.title,
    description: data.description || null,
    url: data.url,
    type: data.type,
    imageUrl: data.imageUrl || null,
    publishedAt: data.publishedAt,
    authorId: adminId,
    isPublished: data.isPublished ?? true,
  });

  // Set tags if provided
  if (data.tagIds && data.tagIds.length > 0) {
    await setNewsEntryTags(newsEntry.id, data.tagIds);
  }

  return newsEntry;
}

export async function updateNewsEntryUseCase(
  adminId: UserId,
  entryId: number,
  data: UpdateNewsEntryInput
) {
  // Check if entry exists
  const existingEntry = await getNewsEntryById(entryId);
  if (!existingEntry) {
    throw new PublicError("News entry not found");
  }

  // Validate title if provided
  if (data.title !== undefined && data.title.length < 3) {
    throw new PublicError("Title must be at least 3 characters");
  }

  // Validate URL if provided
  if (data.url !== undefined && !isValidUrl(data.url)) {
    throw new PublicError("Valid URL is required");
  }

  // Validate type if provided
  if (
    data.type !== undefined &&
    !["video", "blog", "changelog"].includes(data.type)
  ) {
    throw new PublicError("Invalid news entry type");
  }

  // Update the news entry
  const updatedEntry = await updateNewsEntry(entryId, {
    title: data.title,
    description: data.description,
    url: data.url,
    type: data.type,
    imageUrl: data.imageUrl,
    publishedAt: data.publishedAt,
    isPublished: data.isPublished,
  });

  // Update tags if provided
  if (data.tagIds !== undefined) {
    await setNewsEntryTags(entryId, data.tagIds);
  }

  return updatedEntry;
}

export async function deleteNewsEntryUseCase(adminId: UserId, entryId: number) {
  // Check if entry exists
  const existingEntry = await getNewsEntryById(entryId);
  if (!existingEntry) {
    throw new PublicError("News entry not found");
  }

  return deleteNewsEntry(entryId);
}

// News Tags
export async function getAllNewsTagsUseCase() {
  return getAllNewsTags();
}

export async function createNewsTagUseCase(
  adminId: UserId,
  data: CreateNewsTagInput
) {
  // Validate name
  if (!data.name || data.name.length < 2) {
    throw new PublicError("Tag name must be at least 2 characters");
  }

  // Validate color if provided
  if (data.color && !isValidHexColor(data.color)) {
    throw new PublicError("Invalid color format (use #RRGGBB)");
  }

  return createNewsTag({
    name: data.name,
    color: data.color || "#3B82F6",
  });
}

export async function updateNewsTagUseCase(
  adminId: UserId,
  tagId: number,
  data: UpdateNewsTagInput
) {
  // Validate name if provided
  if (data.name !== undefined && data.name.length < 2) {
    throw new PublicError("Tag name must be at least 2 characters");
  }

  // Validate color if provided
  if (data.color && !isValidHexColor(data.color)) {
    throw new PublicError("Invalid color format (use #RRGGBB)");
  }

  return updateNewsTag(tagId, data);
}

export async function deleteNewsTagUseCase(adminId: UserId, tagId: number) {
  return deleteNewsTag(tagId);
}

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}