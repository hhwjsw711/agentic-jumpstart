import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminMiddleware } from "~/lib/auth";
import {
  getAdminUserAnalyticsUseCase,
  getAdminUserDetailsUseCase,
  getAdminUserProgressUseCase,
  getAdminUserCommentsUseCase,
  getAdminUserDownloadStatsUseCase,
} from "~/use-cases/admin-users";

export const getAdminUserAnalyticsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    return getAdminUserAnalyticsUseCase(data.userId);
  });

export const getAdminUserDetailsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    return getAdminUserDetailsUseCase(data.userId);
  });

export const getAdminUserProgressFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    return getAdminUserProgressUseCase(data.userId);
  });

export const getAdminUserCommentsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    return getAdminUserCommentsUseCase(data.userId);
  });

export const getAdminUserDownloadStatsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    return getAdminUserDownloadStatsUseCase(data.userId);
  });
