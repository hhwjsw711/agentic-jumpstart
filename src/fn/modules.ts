import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware, unauthenticatedMiddleware } from "~/lib/auth";
import { z } from "zod";
import {
  getModulesWithSegmentsUseCase,
  reorderModulesUseCase,
} from "~/use-cases/modules";

export const reorderModulesFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.array(z.object({ id: z.number(), order: z.number() })))
  .handler(async ({ data }) => {
    return reorderModulesUseCase(data);
  });

export const getModulesWithSegmentsFn = createServerFn()
  .middleware([unauthenticatedMiddleware])
  .handler(async () => {
    return getModulesWithSegmentsUseCase();
  });
