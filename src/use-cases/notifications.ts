import { Segment } from "~/db/schema";
import { getAllVideoNotificationRecipients } from "~/data-access/users";
import {
  sendBulkEmails,
  renderVideoNotificationEmail,
} from "~/utils/email";
import { createUnsubscribeToken } from "~/data-access/unsubscribe-tokens";
import { env } from "~/utils/env";

/**
 * Sends email notifications to all subscribers about a new segment
 * Includes: premium users, free users, and newsletter subscribers who opted in to course updates
 * @param segment The newly created segment
 */
export async function sendNewSegmentNotificationUseCase(
  segment: Segment
): Promise<{ sent: number; failed: number }> {
  // Get all recipients (premium, free, and newsletter subscribers)
  const allRecipients = await getAllVideoNotificationRecipients();

  if (allRecipients.length === 0) {
    console.log("[Video Notification] No recipients to notify");
    return { sent: 0, failed: 0 };
  }

  // Create video URL and description
  const videoUrl = `${env.HOST_NAME}/learn/${segment.slug}`;
  const videoDescription = segment.content
    ? segment.content.substring(0, 200) + "..."
    : "Check out this new video in the course and continue your learning journey!";

  // Prepare all emails with personalized content
  const emails = await Promise.all(
    allRecipients.map(async (recipient) => {
      // Generate unsubscribe URL
      let unsubscribeUrl = `${env.HOST_NAME}/settings`;
      if (recipient.id) {
        const unsubscribeToken = await createUnsubscribeToken(
          recipient.id,
          recipient.email
        );
        unsubscribeUrl = `${env.HOST_NAME}/unsubscribe?token=${unsubscribeToken}`;
      }

      // Render email HTML
      const html = await renderVideoNotificationEmail({
        videoTitle: segment.title,
        videoDescription,
        videoUrl,
        unsubscribeUrl,
      });

      return {
        to: recipient.email,
        subject: `New Video: ${segment.title}`,
        html,
      };
    })
  );

  // Send all emails using the bulk email utility
  return sendBulkEmails(emails, {
    batchSize: 5,
    logPrefix: "Video Notification",
  });
}
