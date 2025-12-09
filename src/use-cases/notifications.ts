import { Segment } from "~/db/schema";
import { getUsersForEmailing } from "~/data-access/users";
import { sendEmail, renderEmailTemplate } from "~/utils/email";
import { createUnsubscribeToken } from "~/data-access/unsubscribe-tokens";
import { env } from "~/utils/env";

/**
 * Sends email notifications to premium users about a new segment
 * @param segment The newly created segment
 */
export async function sendNewSegmentNotificationUseCase(
  segment: Segment
): Promise<{ sent: number; failed: number }> {
  console.log(`[New Segment Notification] Starting notification for segment: ${segment.title}`);

  // Get premium users who have opted in to course updates
  const premiumUsers = await getUsersForEmailing("premium", false);

  if (premiumUsers.length === 0) {
    console.log("[New Segment Notification] No premium users to notify");
    return { sent: 0, failed: 0 };
  }

  console.log(`[New Segment Notification] Found ${premiumUsers.length} premium users to notify`);

  // Create email content
  const segmentUrl = `${env.HOST_NAME}/learn/${segment.slug}`;
  const emailContent = `
# New Video Available!

A new video has been added to the course:

## ${segment.title}

${segment.content ? segment.content.substring(0, 200) + "..." : "Check out the new content in the course!"}

[Watch Now](${segmentUrl})

---

*This email was sent because you are a premium member and have opted in to course updates.*
`;

  // Render the email template
  const htmlContent = await renderEmailTemplate({
    subject: `New Video: ${segment.title}`,
    content: emailContent,
    isMarketingEmail: false, // Course update email
  });

  let sent = 0;
  let failed = 0;
  const BATCH_SIZE = 5; // 5 emails per second rate limit

  // Process emails in batches with rate limiting
  for (let i = 0; i < premiumUsers.length; i += BATCH_SIZE) {
    const batch = premiumUsers.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(premiumUsers.length / BATCH_SIZE);

    console.log(
      `[New Segment Notification] Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`
    );

    // Send emails in parallel for this batch
    const promises = batch.map(async (user) => {
      try {
        let finalHtmlContent = htmlContent;

        // Generate unsubscribe token if user has an ID
        if (user.id) {
          const unsubscribeToken = await createUnsubscribeToken(
            user.id,
            user.email
          );
          const unsubscribeUrl = `${env.HOST_NAME}/unsubscribe?token=${unsubscribeToken}`;

          // Replace the unsubscribeUrl placeholder in the template
          finalHtmlContent = htmlContent.replace(
            /{{unsubscribeUrl}}/g,
            unsubscribeUrl
          );
        }

        await sendEmail({
          to: user.email,
          subject: `New Video: ${segment.title}`,
          html: finalHtmlContent,
        });

        console.log(
          `[New Segment Notification] Successfully sent email to ${user.email}`
        );
        return { success: true };
      } catch (error) {
        console.error(`[New Segment Notification] Failed to send email to ${user.email}:`, error);
        return { success: false };
      }
    });

    const results = await Promise.all(promises);

    // Count successes and failures
    results.forEach((result) => {
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    });

    // Rate limiting: wait 1 second between batches to maintain 5 emails/second
    if (i + BATCH_SIZE < premiumUsers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(
    `[New Segment Notification] Completed: ${sent} sent, ${failed} failed out of ${premiumUsers.length} total`
  );

  return { sent, failed };
}
