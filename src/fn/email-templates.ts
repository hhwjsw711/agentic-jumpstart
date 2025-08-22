import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminMiddleware } from "~/lib/auth";
import {
  getEmailTemplateByKey,
  updateEmailTemplate,
  initializeDefaultEmailTemplates,
} from "~/data-access/email-templates";

// Get waitlist email template
export const getWaitlistEmailTemplateFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    try {
      // Initialize default templates if needed
      await initializeDefaultEmailTemplates(context.userId!);
      
      const template = await getEmailTemplateByKey("waitlist_welcome");
      
      if (!template) {
        // Return default template if not found
        return {
          key: "waitlist_welcome",
          name: "Waitlist Welcome Email",
          subject: "Welcome to the Waitlist! 🎉",
          content: `Hi there!

Thank you for joining our waitlist! We're excited to have you as part of our early community.

## What's Next?

You're now on the list for early access to our upcoming features and announcements.

## Get Started Today

While you wait, here's a link to our GitHub repository:

[Check out our GitHub repo →](https://github.com/your-repo-here)

Best regards,
The Team`,
          isActive: true,
        };
      }
      
      return template;
    } catch (error) {
      console.error("Failed to get waitlist email template:", error);
      throw new Error("Failed to get waitlist email template");
    }
  });

// Update waitlist email template
const updateWaitlistEmailSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  content: z.string().min(1, "Content is required"),
});

export const updateWaitlistEmailTemplateFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .validator(updateWaitlistEmailSchema)
  .handler(async ({ data, context }) => {
    try {
      const updated = await updateEmailTemplate("waitlist_welcome", {
        subject: data.subject,
        content: data.content,
        updatedBy: context.userId!,
      });

      if (!updated) {
        // Create if it doesn't exist
        await initializeDefaultEmailTemplates(context.userId!);
        
        const retryUpdate = await updateEmailTemplate("waitlist_welcome", {
          subject: data.subject,
          content: data.content,
          updatedBy: context.userId!,
        });
        
        if (!retryUpdate) {
          throw new Error("Failed to update waitlist email template");
        }
        
        return retryUpdate;
      }

      return updated;
    } catch (error) {
      console.error("Failed to update waitlist email template:", error);
      throw new Error("Failed to update waitlist email template");
    }
  });