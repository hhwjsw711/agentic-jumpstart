import { and, eq, desc } from "drizzle-orm";
import { progress, Progress } from "~/db/schema";
import { UserId } from "~/use-cases/types";
import { database } from "~/db";

export type ProgressWithDetails = Awaited<
  ReturnType<typeof getProgressWithDetailsForUser>
>[number];

export async function getProgress(
  userId: UserId,
  segmentId: Progress["segmentId"]
) {
  const progressEntry = await database.query.progress.findFirst({
    where: and(eq(progress.segmentId, segmentId), eq(progress.userId, userId)),
  });
  return progressEntry;
}

export async function getAllProgressForUser(userId: UserId) {
  return database.query.progress.findMany({
    where: eq(progress.userId, userId),
  });
}

export async function markAsWatched(
  userId: UserId,
  segmentId: Progress["segmentId"]
) {
  await database.insert(progress).values({ segmentId, userId });
}

export async function unmarkAsWatched(
  userId: UserId,
  segmentId: Progress["segmentId"]
) {
  await database
    .delete(progress)
    .where(and(eq(progress.segmentId, segmentId), eq(progress.userId, userId)));
}

export async function getProgressWithDetailsForUser(userId: UserId) {
  return database.query.progress.findMany({
    where: eq(progress.userId, userId),
    with: {
      segment: {
        columns: {
          id: true,
          title: true,
          slug: true,
          isPremium: true,
          length: true,
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
    orderBy: [desc(progress.createdAt)],
  });
}
