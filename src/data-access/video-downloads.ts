import { desc, eq, and, count, sql } from "drizzle-orm";
import { database } from "~/db";
import {
  videoDownloads,
  VideoDownloadCreate,
  segments,
  modules,
} from "~/db/schema";
import { UserId } from "~/use-cases/types";

export type VideoDownloadWithDetails = Awaited<
  ReturnType<typeof getVideoDownloadsForUser>
>[number];

export async function trackVideoDownload(data: VideoDownloadCreate) {
  console.log("[trackVideoDownload] Inserting into database:", data);
  try {
    const result = await database
      .insert(videoDownloads)
      .values(data)
      .returning();
    console.log("[trackVideoDownload] Insert successful, returned:", result[0]);
    return result[0];
  } catch (error) {
    console.error("[trackVideoDownload] Database insert failed:", error);
    throw error;
  }
}

export async function getVideoDownloadsForUser(userId: UserId) {
  return database.query.videoDownloads.findMany({
    where: eq(videoDownloads.userId, userId),
    with: {
      segment: {
        columns: {
          id: true,
          title: true,
          slug: true,
          isPremium: true,
        },
        with: {
          module: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: [desc(videoDownloads.createdAt)],
  });
}

export async function getVideoDownloadCountForUser(userId: UserId) {
  const result = await database
    .select({ count: count() })
    .from(videoDownloads)
    .where(eq(videoDownloads.userId, userId));
  return result[0]?.count ?? 0;
}

export async function getUniqueVideoDownloadCountForUser(userId: UserId) {
  const result = await database
    .select({ count: sql<number>`count(distinct ${videoDownloads.segmentId})` })
    .from(videoDownloads)
    .where(eq(videoDownloads.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function getVideoDownloadStats(userId: UserId) {
  const downloads = await getVideoDownloadsForUser(userId);
  const totalDownloads = downloads.length;
  const uniqueVideos = new Set(downloads.map((d) => d.segmentId)).size;
  const premiumDownloads = downloads.filter(
    (d) => d.segment?.isPremium
  ).length;

  // Group by date to see download patterns
  const downloadsByDate = downloads.reduce(
    (acc, download) => {
      const date = download.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Find most downloaded videos
  const videoDownloadCounts = downloads.reduce(
    (acc, download) => {
      const segmentId = download.segmentId;
      if (!acc[segmentId]) {
        acc[segmentId] = {
          count: 0,
          segment: download.segment,
        };
      }
      acc[segmentId].count++;
      return acc;
    },
    {} as Record<number, { count: number; segment: typeof downloads[0]["segment"] }>
  );

  const mostDownloaded = Object.entries(videoDownloadCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([segmentId, data]) => ({
      segmentId: Number(segmentId),
      count: data.count,
      segment: data.segment,
    }));

  return {
    totalDownloads,
    uniqueVideos,
    premiumDownloads,
    downloadsByDate,
    mostDownloaded,
    recentDownloads: downloads.slice(0, 20),
  };
}
