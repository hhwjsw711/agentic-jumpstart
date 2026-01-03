import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "~/lib/auth";
import { trackVideoDownloadUseCase } from "~/use-cases/video-downloads";
import { getRequest } from "@tanstack/react-start/server";

function hashIpAddress(ip: string | null): string | undefined {
  if (!ip) return undefined;
  // Simple hash for privacy
  return Buffer.from(ip).toString("base64").slice(0, 20);
}

export const trackVideoDownloadFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .inputValidator(z.object({ segmentId: z.number() }))
  .handler(async ({ data, context }) => {
    console.log("[trackVideoDownloadFn] Received request:", {
      segmentId: data.segmentId,
      userId: context.userId,
    });

    const request = getRequest();
    const ipAddress =
      request.headers.get("X-Forwarded-For") ??
      request.headers.get("X-Real-IP");
    const userAgent = request.headers.get("User-Agent");

    console.log("[trackVideoDownloadFn] Request metadata:", {
      ipAddress: ipAddress ? "present" : "missing",
      userAgent: userAgent ? "present" : "missing",
    });

    try {
      const result = await trackVideoDownloadUseCase(
        context.userId,
        data.segmentId,
        hashIpAddress(ipAddress),
        userAgent ?? undefined
      );
      console.log("[trackVideoDownloadFn] Successfully tracked download:", result);
      return { success: true };
    } catch (error) {
      console.error("[trackVideoDownloadFn] Failed to track download:", error);
      throw error;
    }
  });
