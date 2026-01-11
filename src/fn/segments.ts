import { createServerFn } from "@tanstack/react-start";
import { getSegments } from "~/data-access/segments";
import { adminMiddleware, unauthenticatedMiddleware } from "~/lib/auth";
import { z } from "zod";
import {
  reorderSegmentsUseCase,
  editSegmentUseCase,
  getSegmentsUseCase,
  getFirstVideoSegmentUseCase,
} from "~/use-cases/segments";
import { getAuthenticatedUser } from "~/utils/auth";
import type { Segment } from "~/db/schema";

/**
 * Helper function to strip premium content from a segment.
 * This protects paid content (transcripts, summary, content) from being
 * exposed to users who haven't purchased access.
 */
function stripPremiumContent(segment: Segment): Segment {
  return {
    ...segment,
    content: null,
    transcripts: null,
    summary: null,
  };
}

export const getSegmentsFn = createServerFn()
  .middleware([unauthenticatedMiddleware])
  .handler(async () => {
    const [segments, user] = await Promise.all([
      getSegmentsUseCase(),
      getAuthenticatedUser(),
    ]);

    // Determine if user has premium access
    const hasPremiumAccess = user?.isPremium || user?.isAdmin || false;

    // Strip premium content from segments if user doesn't have access
    // This protects paid transcripts, summaries, and lesson content
    return segments.map((segment) => {
      if (segment.isPremium && !hasPremiumAccess) {
        return stripPremiumContent(segment);
      }
      return segment;
    });
  });

export const getFirstSegmentFn = createServerFn()
  .middleware([unauthenticatedMiddleware])
  .handler(async () => {
    const [segments, user] = await Promise.all([
      getSegments(),
      getAuthenticatedUser(),
    ]);

    const segment = segments[0] ?? null;
    if (!segment) return null;

    // Determine if user has premium access
    const hasPremiumAccess = user?.isPremium || user?.isAdmin || false;

    // Strip premium content if user doesn't have access
    if (segment.isPremium && !hasPremiumAccess) {
      return stripPremiumContent(segment);
    }

    return segment;
  });

export const getFirstVideoSegmentFn = createServerFn()
  .middleware([unauthenticatedMiddleware])
  .handler(async () => {
    const [result, user] = await Promise.all([
      getFirstVideoSegmentUseCase(),
      getAuthenticatedUser(),
    ]);

    if (!result.segment) return result;

    // Determine if user has premium access
    const hasPremiumAccess = user?.isPremium || user?.isAdmin || false;

    // Strip premium content if user doesn't have access
    if (result.segment.isPremium && !hasPremiumAccess) {
      return {
        ...result,
        segment: stripPremiumContent(result.segment),
      };
    }

    return result;
  });

export const reorderSegmentsFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.array(z.object({ id: z.number(), order: z.number() })))
  .handler(async ({ data }) => {
    return reorderSegmentsUseCase(data);
  });

export const updateSegmentContentFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      segmentId: z.number(),
      field: z.enum(["summary", "content", "transcripts"]),
      value: z.string(),
    })
  )
  .handler(async ({ data }) => {
    return editSegmentUseCase(data.segmentId, { [data.field]: data.value });
  });
