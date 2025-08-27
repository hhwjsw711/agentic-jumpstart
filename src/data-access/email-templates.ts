import { database } from "~/db";
import { emailTemplates } from "~/db/schema";
import { EmailTemplate, EmailTemplateCreate } from "~/db/schema";
import { eq } from "drizzle-orm";

// Get email template by key
export async function getEmailTemplateByKey(
  key: string
): Promise<EmailTemplate | null> {
  const [template] = await database
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.key, key))
    .limit(1);

  return template || null;
}

// Create or update email template
export async function upsertEmailTemplate(
  template: EmailTemplateCreate
): Promise<EmailTemplate> {
  const existing = await getEmailTemplateByKey(template.key);

  if (existing) {
    // Update existing template
    const [updated] = await database
      .update(emailTemplates)
      .set({
        ...template,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.key, template.key))
      .returning();
    return updated;
  } else {
    // Create new template
    const [created] = await database
      .insert(emailTemplates)
      .values(template)
      .returning();
    return created;
  }
}

// Get all email templates
export async function getAllEmailTemplates(): Promise<EmailTemplate[]> {
  return await database
    .select()
    .from(emailTemplates)
    .orderBy(emailTemplates.name);
}

// Update email template
export async function updateEmailTemplate(
  key: string,
  updates: Partial<{
    subject: string;
    content: string;
    isActive: boolean;
    updatedBy: number;
  }>
): Promise<EmailTemplate | null> {
  const [updated] = await database
    .update(emailTemplates)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(emailTemplates.key, key))
    .returning();

  return updated || null;
}

// Get active email template by key
export async function getActiveEmailTemplate(
  key: string
): Promise<EmailTemplate | null> {
  const [template] = await database
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.key, key))
    .where(eq(emailTemplates.isActive, true))
    .limit(1);

  return template || null;
}

// Initialize default email templates if they don't exist
export async function initializeDefaultEmailTemplates(
  adminUserId: number
): Promise<void> {
  const defaultTemplates = [
    {
      key: "waitlist_welcome",
      name: "Waitlist Welcome Email",
      subject: "Welcome to the Waitlist! 🎉",
      content: `Hi there!

Thank you for joining our waitlist! We're excited to have you as part of our early community.

## What's Next?

You're now on the list for early access to our upcoming features and announcements. We'll keep you updated on:

- New course releases
- Platform updates
- Special early-bird offers
- Exclusive content

## Get Started Today

While you wait, here's a link to our GitHub repository where you can explore our resources:

[Check out our GitHub repo →](https://github.com/your-repo-here)

## Stay Connected

Feel free to reply to this email if you have any questions. We'd love to hear from you!

Best regards,
The Team`,
      isActive: true,
      updatedBy: adminUserId,
    },
  ];

  for (const template of defaultTemplates) {
    const existing = await getEmailTemplateByKey(template.key);
    if (!existing) {
      await upsertEmailTemplate(template);
    }
  }
}