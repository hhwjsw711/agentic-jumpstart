import {createServerFn} from "@tanstack/react-start";
import {adminMiddleware} from "~/lib/auth";
import {z} from "zod";
import {getFeatureFlagTargetingUseCase, updateFeatureFlagTargetingUseCase,} from "~/use-cases/feature-flags";
import {searchUsersWithProfile, getUsersByIds, getUsersByEmails} from "~/data-access/feature-flags";
import {FLAG_KEYS, TARGET_MODES} from "~/config";

const flagKeySchema = z.enum(FLAG_KEYS);

const targetModeSchema = z.enum([
  TARGET_MODES.ALL,
  TARGET_MODES.PREMIUM,
  TARGET_MODES.NON_PREMIUM,
  TARGET_MODES.CUSTOM,
]);

export const getFeatureFlagTargetingFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(z.object({ flagKey: flagKeySchema }))
  .handler(async ({ data }) => {
    return getFeatureFlagTargetingUseCase(data.flagKey);
  });

export const updateFeatureFlagTargetingFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(
    z.object({
      flagKey: flagKeySchema,
      targetMode: targetModeSchema,
      userIds: z.array(z.number()).max(1000).optional(),
    })
  )
  .handler(async ({ data }) => {
    await updateFeatureFlagTargetingUseCase(
      data.flagKey,
      data.targetMode,
      data.userIds
    );
    return { success: true };
  });

export const searchUsersForFlagFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    return searchUsersWithProfile(data.query);
  });

export const getUsersByIdsFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(z.object({ userIds: z.array(z.number()).max(1000) }))
  .handler(async ({ data }) => {
    return getUsersByIds(data.userIds);
  });

export const getUsersByEmailsFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(z.object({ emails: z.array(z.email()).max(1000) }))
  .handler(async ({ data }) => {
    return getUsersByEmails(data.emails);
  });
