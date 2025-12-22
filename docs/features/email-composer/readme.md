# Email Composer Feature

## Overview

The Email Composer feature provides a comprehensive email marketing solution for course administrators, enabling them to send professional bulk emails to course participants with advanced segmentation, progress tracking, and user preference management.

## Quick Start

### For Administrators

1. **Access the Email Composer**
   - Navigate to `/admin/emails` (admin access required)
   - Click "Emails" in the admin navigation menu

2. **Compose Your Email**
   - Enter a subject line (max 200 characters)
   - Select your target audience (All Users, Premium Only, or Free Only)
   - Write your email content in the text area
   - Use the preview feature to review formatting

3. **Test Before Sending**
   - Click "Send Test" to send a test email to yourself
   - Enter your email address in the test dialog
   - Verify content and formatting

4. **Send Your Campaign**
   - Click "Send Email" to start the bulk email process
   - Monitor progress in the "Recent Email Batches" section
   - Track delivery status and metrics

### For Users

1. **Manage Email Preferences**
   - Go to `/settings` or click "Settings" in your account dropdown
   - Toggle your preferences for course updates and promotional emails
   - Click "Save Preferences" to apply changes

## Features

### Admin Email Composer Interface
- **Professional composition UI** with subject and content fields
- **Recipient targeting** with real-time count display
- **Live email preview** with formatted content display
- **Test email functionality** for content verification
- **Bulk email sending** with background processing
- **Progress tracking** with visual indicators
- **Email batch history** with status and metrics

### User Email Preferences
- **Granular control** over email types (course updates vs promotional)
- **Persistent preferences** stored securely in database
- **Default opt-in** behavior for new users
- **Immediate feedback** when saving preferences

### Professional Email Templates
- **Responsive design** compatible with all email clients
- **Consistent branding** with course platform styling
- **Professional typography** and spacing
- **Automatic formatting** for text content

### Advanced Email Processing
- **Background processing** prevents UI blocking
- **Rate limiting** at 5 emails/second (Resend compliance)
- **Automatic retry logic** for failed deliveries
- **Comprehensive error handling** and logging

## Technical Architecture

### Database Schema

#### Email Batches Table
```sql
emailBatches:
- id (serial, primary key)
- subject (text, not null)
- htmlContent (text, not null)  
- recipientCount (integer, not null)
- sentCount (integer, default 0)
- failedCount (integer, default 0)
- status (text, not null) -- pending, processing, completed, failed
- adminId (integer, foreign key to users)
- createdAt (timestamp)
- updatedAt (timestamp)
```

#### User Email Preferences Table
```sql
userEmailPreferences:
- id (serial, primary key)
- userId (integer, foreign key to users, unique)
- allowCourseUpdates (boolean, default true)
- allowPromotional (boolean, default true)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### API Endpoints

#### Admin Email Functions
- `POST /admin/emails/create` - Create and send email batch
- `POST /admin/emails/test` - Send test email
- `GET /admin/emails/batches` - Get email batch history
- `GET /admin/emails/users` - Get recipient statistics

#### User Settings Functions
- `GET /settings/preferences` - Get user email preferences
- `POST /settings/preferences` - Update user email preferences

### File Structure

```
src/
├── routes/
│   ├── admin/emails.tsx         # Admin email composer UI
│   └── settings.tsx             # User settings page
├── fn/
│   ├── emails.ts               # Email server functions
│   └── user-settings.ts        # User settings server functions
├── data-access/
│   └── emails.ts               # Email data access layer
├── components/
│   └── emails/
│       └── course-update-email.tsx  # React Email template
├── utils/
│   └── email.ts                # Resend integration
└── db/
    └── schema.ts               # Database schema definitions
```

## Setup Instructions

### Prerequisites

1. **Resend Account** with API access
2. **Domain ownership** for email sending
3. **DNS management** access for domain verification
4. **Node.js environment** with all project dependencies

### 1. Resend Configuration

#### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for a free account (3,000 emails/month)

#### Step 2: Add and Verify Your Domain
1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Add the DNS records provided by Resend:
   - SPF record (TXT)
   - DKIM records (CNAME)
   - Optional: DMARC record (TXT)
4. Wait for verification (usually within minutes)

#### Step 3: Generate API Key
1. Go to Resend Dashboard → API Keys
2. Click "Create API Key"
3. Name your key (e.g., 'production')
4. Copy the API key (shown only once)

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL_ADDRESS="Your App Name <no-reply@yourdomain.com>"
```

### 3. Database Migration

Apply the database schema changes:

```bash
# Generate migration for new tables
npm run db:generate

# Apply migration to database
npm run db:migrate
```

### 4. Verification

Test your setup:

1. Start your application with `npm run dev`
2. Navigate to Admin → Emails → Compose
3. Send a test email to verify delivery

## Usage Examples

### Admin: Send Course Update Email

1. Navigate to `/admin/emails`
2. Fill in email details:
   ```
   Subject: New Course Module Released - Advanced AI Agents
   Recipients: Premium Users Only
   Content: We've just released a new module covering advanced AI agent architectures. This module includes hands-on examples with LangChain and AutoGPT implementations.
   ```
3. Click "Preview" to review formatting
4. Click "Send Test" and enter your email to test
5. Click "Send Email" to start the campaign

### User: Update Email Preferences

1. Navigate to `/settings`
2. In the "Email Preferences" section:
   - Toggle "Course Updates" (for new content notifications)
   - Toggle "Promotional Emails" (for offers and announcements)
3. Click "Save Preferences"

### Admin: Monitor Email Campaign

1. In the "Recent Email Batches" section, view:
   - Campaign subject and creation date
   - Status badge (processing, completed, failed)
   - Progress bar showing sent/total ratio
   - Failed delivery count (if any)

## Troubleshooting

### Common Issues

#### Domain Verification Fails
- DNS propagation usually takes a few minutes with Resend
- Use DNS lookup tools to verify records are propagated
- Check Resend dashboard for verification status

#### Email Sending Fails
- Verify API key is correct and has proper permissions
- Check if domain is verified in Resend dashboard
- Review Resend logs for delivery status

Common error codes:
- `validation_error`: Invalid email format or missing fields
- `not_found`: Domain not found or not verified
- `rate_limit_exceeded`: Too many requests, slow down

#### Rate Limiting Issues
- Free tier: 100 emails/day, 3,000 emails/month
- Upgrade to paid plan for higher limits
- Check Resend dashboard for usage stats

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=email:*
```

Check logs for detailed error information:
```bash
# View email processing logs
tail -f logs/email.log

# Check database email batch status
npm run db:studio
```

## Performance Considerations

### Rate Limiting
- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Paid Plans**: Configurable, much higher limits
- **Current Implementation**: 5 emails/second to ensure compliance

### Batch Processing
- Emails are processed in batches of 5
- 1-second delay between batches
- Background processing prevents UI blocking
- Progress updates every batch

### Database Optimization
- Email batches are limited to 10 most recent in UI
- User preference queries are optimized with indexes
- Foreign key relationships ensure data integrity

## Security Features

### Access Control
- Admin middleware protects all email endpoints
- Input validation prevents XSS and injection attacks
- Rate limiting prevents abuse

### Data Protection
- Resend API key stored securely in environment variables
- User email preferences encrypted in database
- GDPR-compliant opt-out mechanisms

### Email Authentication
- DKIM signatures for improved deliverability
- SPF record support for sender verification
- Bounce and complaint handling infrastructure

## Integration Points

### TanStack Start Integration
- Server functions for email processing
- React Query for data fetching and caching
- File-based routing for admin and user pages

### Database Integration
- Drizzle ORM for type-safe database operations
- PostgreSQL for reliable data storage
- Migrations for schema versioning

### UI Component Integration
- shadcn/ui components for consistent styling
- React Hook Form for form validation
- Tailwind CSS for responsive design

## Monitoring and Analytics

### Available Metrics
- Email batch status and progress
- Send success and failure rates
- User preference adoption rates
- Campaign delivery times

### Logging
- Comprehensive error logging for troubleshooting
- Email send attempt tracking
- Resend API interaction logs

### Future Analytics
- Email open rates (planned)
- Click-through tracking (planned)
- User engagement metrics (planned)

## Support and Documentation

### Additional Resources
- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [React Email Documentation](https://react.email/)
- [Infrastructure Setup Guide](/infra/README.md)

### Getting Help
1. Check the troubleshooting section above
2. Review Resend dashboard for service-specific errors
3. Verify DNS configuration in Resend dashboard
4. Check application logs for detailed error information

### Feature Requests
Submit feature requests for enhancements like:
- Advanced email templates
- Automated drip campaigns  
- A/B testing capabilities
- Enhanced analytics and reporting