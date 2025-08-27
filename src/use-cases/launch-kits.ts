import {
  createLaunchKit,
  deleteLaunchKit,
  getAllLaunchKits,
  getLaunchKitById,
  getLaunchKitBySlug,
  updateLaunchKit,
  incrementCloneCount,
  getAllTags,
  getTagById,
  getTagsByCategory,
  createTag,
  updateTag,
  deleteTag,
  getTagUsageCount,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getLaunchKitTags,
  setLaunchKitTags,
  getLaunchKitComments,
  createLaunchKitComment,
  updateLaunchKitComment,
  deleteLaunchKitComment,
  trackLaunchKitEvent,
  getLaunchKitStats,
} from "~/data-access/launch-kits";
import { PublicError } from "./errors";
import { getUser } from "~/data-access/users";
import type { UserId } from "./types";

export type CreateLaunchKitInput = {
  name: string;
  description: string;
  longDescription?: string;
  repositoryUrl: string;
  demoUrl?: string;
  imageUrl?: string;
  tagIds?: number[];
};

export type UpdateLaunchKitInput = Partial<CreateLaunchKitInput>;

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = {
  name?: string;
};

export type CreateTagInput = {
  name: string;
  color?: string;
  categoryId?: number;
};

export type UpdateTagInput = {
  name?: string;
  color?: string;
  categoryId?: number;
};

export type CreateCommentInput = {
  content: string;
  parentId?: number;
};

// Launch Kit Management (Admin Only)
export async function createLaunchKitUseCase(
  userId: UserId,
  data: CreateLaunchKitInput
) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can create launch kits");
  }

  // Validate required fields
  if (!data.name || data.name.length < 2) {
    throw new PublicError("Launch kit name must be at least 2 characters");
  }

  if (!data.description || data.description.length < 10) {
    throw new PublicError("Launch kit description must be at least 10 characters");
  }

  if (!data.repositoryUrl || !isValidUrl(data.repositoryUrl)) {
    throw new PublicError("Valid repository URL is required");
  }

  if (data.demoUrl && !isValidUrl(data.demoUrl)) {
    throw new PublicError("Demo URL must be a valid URL");
  }

  // Create launch kit
  const launchKit = await createLaunchKit({
    name: data.name,
    description: data.description,
    longDescription: data.longDescription,
    repositoryUrl: data.repositoryUrl,
    demoUrl: data.demoUrl,
    imageUrl: data.imageUrl,
  });

  // Set tags if provided
  if (data.tagIds && data.tagIds.length > 0) {
    await setLaunchKitTags(launchKit.id, data.tagIds);
  }

  return launchKit;
}

export async function updateLaunchKitUseCase(
  userId: UserId,
  launchKitId: number,
  data: UpdateLaunchKitInput
) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can update launch kits");
  }

  // Check if launch kit exists
  const launchKit = await getLaunchKitById(launchKitId);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  // Validate fields if provided
  if (data.name !== undefined && data.name.length < 2) {
    throw new PublicError("Launch kit name must be at least 2 characters");
  }

  if (data.description !== undefined && data.description.length < 10) {
    throw new PublicError("Launch kit description must be at least 10 characters");
  }

  if (data.repositoryUrl !== undefined && !isValidUrl(data.repositoryUrl)) {
    throw new PublicError("Valid repository URL is required");
  }

  if (data.demoUrl !== undefined && data.demoUrl && !isValidUrl(data.demoUrl)) {
    throw new PublicError("Demo URL must be a valid URL");
  }

  // Update launch kit
  const updatedLaunchKit = await updateLaunchKit(launchKitId, data);

  // Update tags if provided
  if (data.tagIds !== undefined) {
    await setLaunchKitTags(launchKitId, data.tagIds);
  }

  return updatedLaunchKit;
}

export async function deleteLaunchKitUseCase(userId: UserId, launchKitId: number) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can delete launch kits");
  }

  // Check if launch kit exists
  const launchKit = await getLaunchKitById(launchKitId);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  return deleteLaunchKit(launchKitId);
}

// Public Launch Kit Access
export async function getAllLaunchKitsUseCase(filters?: {
  tags?: string[];
  search?: string;
}) {
  return getAllLaunchKits(filters);
}

export async function getLaunchKitByIdUseCase(id: number) {
  const launchKit = await getLaunchKitById(id);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  // Get tags for the launch kit
  const tags = await getLaunchKitTags(launchKit.id);

  return {
    ...launchKit,
    tags,
  };
}

export async function getLaunchKitBySlugUseCase(slug: string) {
  const launchKit = await getLaunchKitBySlug(slug);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  // Get tags for the launch kit
  const tags = await getLaunchKitTags(launchKit.id);

  return {
    ...launchKit,
    tags,
  };
}

export async function cloneLaunchKitUseCase(slug: string, userId?: UserId) {
  const launchKit = await getLaunchKitBySlug(slug);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  // Increment clone count
  await incrementCloneCount(launchKit.id);

  // Track analytics event
  await trackLaunchKitEvent({
    launchKitId: launchKit.id,
    userId: userId || null,
    eventType: "clone",
  });

  return launchKit;
}

// Category Management (Admin Only)
export async function createCategoryUseCase(userId: UserId, data: CreateCategoryInput) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can create categories");
  }

  // Validate name
  if (!data.name || data.name.length < 2 || data.name.length > 50) {
    throw new PublicError("Category name must be between 2 and 50 characters");
  }

  // Check if category already exists
  const existing = await getCategoryBySlug(data.name.toLowerCase().replace(/\s+/g, '-'));
  if (existing) {
    throw new PublicError("A category with this name already exists");
  }

  return createCategory({ name: data.name });
}

export async function updateCategoryUseCase(userId: UserId, categoryId: number, data: UpdateCategoryInput) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can update categories");
  }

  // Check if category exists
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new PublicError("Category not found");
  }

  // Validate name if provided
  if (data.name !== undefined) {
    if (data.name.length < 2 || data.name.length > 50) {
      throw new PublicError("Category name must be between 2 and 50 characters");
    }

    // Check for duplicate name
    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const existing = await getCategoryBySlug(slug);
    if (existing && existing.id !== categoryId) {
      throw new PublicError("A category with this name already exists");
    }
  }

  return updateCategory(categoryId, data);
}

export async function deleteCategoryUseCase(userId: UserId, categoryId: number) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can delete categories");
  }

  // Check if category exists
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new PublicError("Category not found");
  }

  // Note: Tags in this category will be orphaned (categoryId set to null due to cascade)
  return deleteCategory(categoryId);
}

export async function getAllCategoriesUseCase() {
  return getAllCategories();
}

// Tag Management (Admin Only)
export async function createTagUseCase(userId: UserId, data: CreateTagInput) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can create tags");
  }

  // Validate name
  if (!data.name || data.name.length < 2 || data.name.length > 30) {
    throw new PublicError("Tag name must be between 2 and 30 characters");
  }

  // Check for duplicate name
  const existing = await getAllTags();
  if (existing.some(tag => tag.name.toLowerCase() === data.name.toLowerCase())) {
    throw new PublicError("A tag with this name already exists");
  }

  // Validate category if provided
  if (data.categoryId) {
    const category = await getCategoryById(data.categoryId);
    if (!category) {
      throw new PublicError("Invalid category");
    }
  }

  // Validate color if provided
  if (data.color && !isValidHexColor(data.color)) {
    throw new PublicError("Please enter a valid hex color code");
  }

  return createTag({
    name: data.name,
    color: data.color || "#3B82F6",
    categoryId: data.categoryId,
  });
}

export async function updateTagUseCase(userId: UserId, tagId: number, data: UpdateTagInput) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can update tags");
  }

  // Check if tag exists
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new PublicError("Tag not found");
  }

  // Validate name if provided
  if (data.name !== undefined) {
    if (data.name.length < 2 || data.name.length > 30) {
      throw new PublicError("Tag name must be between 2 and 30 characters");
    }

    // Check for duplicate name
    const existing = await getAllTags();
    if (existing.some(t => t.name.toLowerCase() === data.name.toLowerCase() && t.id !== tagId)) {
      throw new PublicError("A tag with this name already exists");
    }
  }

  // Validate category if provided
  if (data.categoryId !== undefined && data.categoryId !== null) {
    const category = await getCategoryById(data.categoryId);
    if (!category) {
      throw new PublicError("Invalid category");
    }
  }

  // Validate color if provided
  if (data.color && !isValidHexColor(data.color)) {
    throw new PublicError("Please enter a valid hex color code");
  }

  return updateTag(tagId, data);
}

export async function deleteTagUseCase(userId: UserId, tagId: number) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can delete tags");
  }

  // Check if tag exists
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new PublicError("Tag not found");
  }

  // Check if tag is in use
  const usageCount = await getTagUsageCount(tagId);
  if (usageCount > 0) {
    throw new PublicError(`Tag is in use by ${usageCount} launch kit${usageCount > 1 ? 's' : ''}`);
  }

  return deleteTag(tagId);
}

export async function getAllTagsUseCase() {
  return getAllTags();
}

export async function getTagsByCategoryUseCase() {
  return getTagsByCategory();
}

// Comments
export async function getLaunchKitCommentsUseCase(launchKitId: number) {
  return getLaunchKitComments(launchKitId);
}

export async function createLaunchKitCommentUseCase(
  userId: UserId,
  launchKitId: number,
  data: CreateCommentInput
) {
  // Validate launch kit exists
  const launchKit = await getLaunchKitById(launchKitId);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  // Validate content
  if (!data.content || data.content.length < 1) {
    throw new PublicError("Comment content is required");
  }

  if (data.content.length > 2000) {
    throw new PublicError("Comment content must be less than 2000 characters");
  }

  return createLaunchKitComment({
    userId,
    launchKitId,
    content: data.content,
    parentId: data.parentId,
  });
}

export async function updateLaunchKitCommentUseCase(
  userId: UserId,
  commentId: number,
  content: string
) {
  // TODO: Add ownership check
  if (!content || content.length < 1) {
    throw new PublicError("Comment content is required");
  }

  if (content.length > 2000) {
    throw new PublicError("Comment content must be less than 2000 characters");
  }

  return updateLaunchKitComment(commentId, content);
}

export async function deleteLaunchKitCommentUseCase(
  userId: UserId,
  commentId: number
) {
  // TODO: Add ownership check or admin check
  return deleteLaunchKitComment(commentId);
}

// Analytics
export async function trackLaunchKitViewUseCase(slug: string, userId?: UserId) {
  const launchKit = await getLaunchKitBySlug(slug);
  if (!launchKit) {
    throw new PublicError("Launch kit not found");
  }

  await trackLaunchKitEvent({
    launchKitId: launchKit.id,
    userId: userId || null,
    eventType: "view",
  });
}

export async function getLaunchKitStatsUseCase(userId: UserId) {
  // Validate user is admin
  const user = await getUser(userId);
  if (!user?.isAdmin) {
    throw new PublicError("Only admins can view launch kit stats");
  }

  return getLaunchKitStats();
}

// Utility functions
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