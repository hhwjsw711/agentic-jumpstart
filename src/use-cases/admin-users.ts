import { getUserWithProfileById } from "~/data-access/users";
import { getProgressWithDetailsForUser } from "~/data-access/progress";
import { getCommentsForUser } from "~/data-access/comments";
import { getVideoDownloadStats } from "~/data-access/video-downloads";
import { PublicError } from "./errors";
import { UserId } from "./types";

export async function getAdminUserDetailsUseCase(userId: UserId) {
  const user = await getUserWithProfileById(userId);

  if (!user) {
    throw new PublicError("User not found");
  }

  return user;
}

export async function getAdminUserProgressUseCase(userId: UserId) {
  return getProgressWithDetailsForUser(userId);
}

export async function getAdminUserCommentsUseCase(userId: UserId) {
  return getCommentsForUser(userId);
}

export async function getAdminUserDownloadStatsUseCase(userId: UserId) {
  return getVideoDownloadStats(userId);
}

export async function getAdminUserAnalyticsUseCase(userId: UserId) {
  const [user, progress, comments, downloadStats] = await Promise.all([
    getUserWithProfileById(userId),
    getProgressWithDetailsForUser(userId),
    getCommentsForUser(userId),
    getVideoDownloadStats(userId),
  ]);

  if (!user) {
    throw new PublicError("User not found");
  }

  return {
    user,
    progress,
    comments,
    downloadStats,
  };
}
