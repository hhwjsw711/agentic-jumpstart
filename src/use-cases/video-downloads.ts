import { trackVideoDownload } from "~/data-access/video-downloads";
import { UserId } from "./types";

export async function trackVideoDownloadUseCase(
  userId: UserId,
  segmentId: number,
  ipAddressHash?: string,
  userAgent?: string
) {
  console.log("[trackVideoDownloadUseCase] Tracking download:", {
    userId,
    segmentId,
    hasIpHash: !!ipAddressHash,
    hasUserAgent: !!userAgent,
  });

  const result = await trackVideoDownload({
    userId,
    segmentId,
    ipAddressHash: ipAddressHash ?? null,
    userAgent: userAgent ?? null,
  });

  console.log("[trackVideoDownloadUseCase] Database result:", result);
  return result;
}
