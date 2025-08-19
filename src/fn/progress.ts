import { createServerFn } from "@tanstack/react-start";
import { authenticatedMiddleware, unauthenticatedMiddleware } from "~/lib/auth";
import { z } from "zod";
import {
  getAllProgressForUserUseCase,
  markAsWatchedUseCase,
} from "~/use-cases/progress";

export const markedAsWatchedFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(z.object({ segmentId: z.coerce.number() }))
  .handler(async ({ data, context }) => {
    await markAsWatchedUseCase(context.userId, data.segmentId);
  });

export const getProgressFn = createServerFn()
  .middleware([unauthenticatedMiddleware])
  .handler(async ({ context }) => {
    return context.userId ? getAllProgressForUserUseCase(context.userId) : [];
  });
