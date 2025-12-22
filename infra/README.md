# Resend Email Service Setup

This directory contains a setup guide for configuring Resend as your email service provider.

## Prerequisites

1. **Resend Account** - Sign up at https://resend.com
2. **Domain ownership** - You need to own a domain for email sending
3. **DNS access** - Ability to add TXT and CNAME records to your domain

## Scripts Overview

### `setup-resend.sh`
Provides a step-by-step guide to configure Resend for your application.

```bash
./setup-resend.sh
```

**What it covers:**
- Creating a Resend account
- Adding and verifying your domain
- Generating an API key
- Configuring environment variables
- Testing your setup

## Quick Setup Process

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for a free account (3,000 emails/month)

### Step 2: Add Your Domain
1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Add the DNS records provided by Resend:
   - SPF record (TXT)
   - DKIM records (CNAME)
   - Optional: DMARC record (TXT)

### Step 3: Generate API Key
1. Go to Resend Dashboard → API Keys
2. Click "Create API Key"
3. Copy the API key (shown only once)

### Step 4: Configure Environment
Add the following to your `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL_ADDRESS="Your App Name <no-reply@yourdomain.com>"
```

### Step 5: Verify Setup
1. Start your application
2. Go to Admin → Emails → Compose
3. Send a test email to verify

## DNS Records Required

### SPF Record (TXT)
```
Name: yourdomain.com (or @ for root)
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
```

### DKIM Records (CNAME)
Resend will provide specific CNAME records for your domain. They typically look like:
```
Name: resend._domainkey.yourdomain.com
Type: CNAME
Value: [provided by Resend]
```

## Rate Limits

### Free Tier
- 3,000 emails per month
- 100 emails per day
- No daily sending limit on test mode

### Paid Plans
- Higher sending limits
- Additional features like webhooks
- See https://resend.com/pricing for details

## Resend vs AWS SES Comparison

| Feature | Resend | AWS SES |
|---------|--------|---------|
| Setup Complexity | Simple | Complex |
| API Design | Modern, developer-friendly | Traditional AWS SDK |
| Pricing | Free tier: 3k/month | Pay per email (~$0.10/1000) |
| Domain Verification | Minutes | Up to 72 hours |
| Dashboard | Modern UI | AWS Console |
| React Email | Native support | Manual integration |

## Troubleshooting

### Domain Verification Issues
- DNS propagation usually takes a few minutes with Resend
- Use DNS lookup tools to verify records are propagated
- Check Resend dashboard for verification status

### Email Sending Issues
- Verify API key is correct and has proper permissions
- Check if domain is verified in Resend dashboard
- Review Resend logs for delivery status

### Common Error Codes
- `validation_error`: Invalid email format or missing fields
- `not_found`: Domain not found or not verified
- `rate_limit_exceeded`: Too many requests, slow down

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [React Email](https://react.email) - Email template library
- [Resend Pricing](https://resend.com/pricing)

## Support

For issues with email sending:
1. Check the Resend dashboard for delivery logs
2. Verify DNS records are correctly configured
3. Ensure API key has proper permissions
4. Check application logs for detailed error information
