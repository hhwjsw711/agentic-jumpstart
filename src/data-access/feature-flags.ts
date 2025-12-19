import { eq, and, ilike, inArray } from "drizzle-orm";
import { database, type DatabaseOrTransaction } from "~/db";
import { featureFlagTargets, featureFlagUsers, users, profiles } from "~/db/schema";
import { TARGET_MODES, type TargetMode, type FlagKey } from "~/config";

export async function getFeatureFlagTarget(flagKey: FlagKey) {
  try {
    const result = await database
      .select()
      .from(featureFlagTargets)
      .where(eq(featureFlagTargets.flagKey, flagKey))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`Error getting feature flag target for ${flagKey}:`, error);
    return null;
  }
}

export async function setFeatureFlagTarget(
  flagKey: FlagKey,
  targetMode: TargetMode,
  db: DatabaseOrTransaction = database
) {
  try {
    await db
      .insert(featureFlagTargets)
      .values({
        flagKey,
        targetMode,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: featureFlagTargets.flagKey,
        set: {
          targetMode,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error(`Error setting feature flag target for ${flagKey}:`, error);
    throw error;
  }
}

export async function getFeatureFlagUsers(flagKey: FlagKey) {
  try {
    return await database
      .select({
        id: featureFlagUsers.id,
        flagKey: featureFlagUsers.flagKey,
        userId: featureFlagUsers.userId,
        enabled: featureFlagUsers.enabled,
        createdAt: featureFlagUsers.createdAt,
        userEmail: users.email,
        userIsPremium: users.isPremium,
        userIsAdmin: users.isAdmin,
        displayName: profiles.displayName,
        image: profiles.image,
      })
      .from(featureFlagUsers)
      .innerJoin(users, eq(featureFlagUsers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(featureFlagUsers.flagKey, flagKey));
  } catch (error) {
    console.error(`Error getting feature flag users for ${flagKey}:`, error);
    return [];
  }
}

export async function getFeatureFlagUser(flagKey: FlagKey, userId: number) {
  try {
    const result = await database
      .select()
      .from(featureFlagUsers)
      .where(
        and(
          eq(featureFlagUsers.flagKey, flagKey),
          eq(featureFlagUsers.userId, userId)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`Error getting feature flag user for ${flagKey}/${userId}:`, error);
    return null;
  }
}

export async function addFeatureFlagUser(
  flagKey: FlagKey,
  userId: number,
  enabled: boolean = true
) {
  try {
    await database
      .insert(featureFlagUsers)
      .values({
        flagKey,
        userId,
        enabled,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [featureFlagUsers.flagKey, featureFlagUsers.userId],
        set: {
          enabled,
        },
      });
  } catch (error) {
    console.error(`Error adding feature flag user for ${flagKey}/${userId}:`, error);
    throw error;
  }
}

export async function removeFeatureFlagUser(flagKey: FlagKey, userId: number) {
  try {
    await database
      .delete(featureFlagUsers)
      .where(
        and(
          eq(featureFlagUsers.flagKey, flagKey),
          eq(featureFlagUsers.userId, userId)
        )
      );
  } catch (error) {
    console.error(`Error removing feature flag user for ${flagKey}/${userId}:`, error);
    throw error;
  }
}

export async function bulkSetFeatureFlagUsers(
  flagKey: FlagKey,
  userIds: number[],
  enabled: boolean = true,
  db: DatabaseOrTransaction = database
) {
  try {
    await db.delete(featureFlagUsers).where(eq(featureFlagUsers.flagKey, flagKey));

    if (userIds.length > 0) {
      await db.insert(featureFlagUsers).values(
        userIds.map((userId) => ({
          flagKey,
          userId,
          enabled,
          createdAt: new Date(),
        }))
      );
    }
  } catch (error) {
    console.error(`Error bulk setting feature flag users for ${flagKey}:`, error);
    throw error;
  }
}

export async function clearFeatureFlagUsers(
  flagKey: FlagKey,
  db: DatabaseOrTransaction = database
) {
  try {
    await db
      .delete(featureFlagUsers)
      .where(eq(featureFlagUsers.flagKey, flagKey));
  } catch (error) {
    console.error(`Error clearing feature flag users for ${flagKey}:`, error);
    throw error;
  }
}

/**
 * Update feature flag targeting in a single transaction.
 * Handles setting target mode and managing users atomically.
 */
export async function updateFeatureFlagTargeting(
  flagKey: FlagKey,
  targetMode: TargetMode,
  userIds?: number[]
) {
  await database.transaction(async (tx) => {
    await setFeatureFlagTarget(flagKey, targetMode, tx);

    if (targetMode === TARGET_MODES.CUSTOM && userIds) {
      await bulkSetFeatureFlagUsers(flagKey, userIds, true, tx);
    } else if (targetMode !== TARGET_MODES.CUSTOM) {
      await clearFeatureFlagUsers(flagKey, tx);
    }
  });
}

export async function searchUsersWithProfile(query: string) {
  // Escape LIKE pattern special characters to prevent pattern injection
  const sanitizedQuery = query.replace(/[%_\\]/g, "\\$&");

  const results = await database
    .select({
      id: users.id,
      email: users.email,
      isPremium: users.isPremium,
      isAdmin: users.isAdmin,
      displayName: profiles.displayName,
      image: profiles.image,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(ilike(users.email, `%${sanitizedQuery}%`))
    .limit(20);

  return results.filter((u) => u.email !== null);
}

export async function getUsersByIds(userIds: number[]) {
  if (userIds.length === 0) return [];

  return await database.query.users.findMany({
    where: (users, { inArray: inArrayFn }) => inArrayFn(users.id, userIds),
    columns: {
      id: true,
      email: true,
      isPremium: true,
    },
  });
}

export async function getUsersByEmails(emails: string[]) {
  if (emails.length === 0) return [];

  const results = await database.query.users.findMany({
    where: (users, { inArray: inArrayFn }) => inArrayFn(users.email, emails),
    columns: {
      id: true,
      email: true,
      isPremium: true,
      isAdmin: true,
    },
    with: {
      profile: {
        columns: {
          displayName: true,
          image: true,
        },
      },
    },
  });

  return results.map((u) => ({
    id: u.id,
    email: u.email,
    isPremium: u.isPremium,
    isAdmin: u.isAdmin,
    displayName: u.profile?.displayName ?? null,
    image: u.profile?.image ?? null,
  }));
}
