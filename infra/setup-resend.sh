#!/bin/bash

# Resend Email Service Setup Script
# This script guides you through configuring Resend for email sending

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Main execution
main() {
    echo ""
    echo "==========================================="
    echo "       Resend Email Service Setup         "
    echo "==========================================="
    echo ""

    print_status "Resend is a modern email API service that makes sending emails simple and reliable."
    echo ""

    print_step "Step 1: Create a Resend Account"
    echo "   1. Go to https://resend.com"
    echo "   2. Sign up for a free account"
    echo "   3. The free tier includes 3,000 emails/month and 100 emails/day"
    echo ""

    print_step "Step 2: Add and Verify Your Domain"
    echo "   1. Go to Resend Dashboard → Domains"
    echo "   2. Click 'Add Domain'"
    echo "   3. Enter your domain (e.g., example.com)"
    echo "   4. Add the DNS records provided by Resend:"
    echo "      - SPF record (TXT)"
    echo "      - DKIM records (CNAME)"
    echo "      - Optional: DMARC record (TXT)"
    echo "   5. Wait for verification (usually within minutes)"
    echo ""

    print_step "Step 3: Generate an API Key"
    echo "   1. Go to Resend Dashboard → API Keys"
    echo "   2. Click 'Create API Key'"
    echo "   3. Name your key (e.g., 'production' or 'development')"
    echo "   4. Set appropriate permissions (Full access for most use cases)"
    echo "   5. Copy the API key immediately (it won't be shown again)"
    echo ""

    print_step "Step 4: Update Environment Variables"
    echo "   Add the following to your .env file:"
    echo ""
    echo '   RESEND_API_KEY=re_your_api_key_here'
    echo '   FROM_EMAIL_ADDRESS="Your App Name <no-reply@yourdomain.com>"'
    echo ""

    print_step "Step 5: Test Your Setup"
    echo "   1. Start your application"
    echo "   2. Go to Admin → Emails → Compose"
    echo "   3. Send a test email to verify everything works"
    echo ""

    print_status "Additional Resources:"
    echo "   - Resend Documentation: https://resend.com/docs"
    echo "   - API Reference: https://resend.com/docs/api-reference"
    echo "   - React Email Templates: https://react.email"
    echo "   - Pricing: https://resend.com/pricing"
    echo ""

    print_warning "Rate Limits (Free Tier):"
    echo "   - 3,000 emails per month"
    echo "   - 100 emails per day"
    echo "   - Upgrade to a paid plan for higher limits"
    echo ""

    print_status "Features Available:"
    echo "   ✓ Email sending via simple API"
    echo "   ✓ Built-in bounce and complaint handling"
    echo "   ✓ Email analytics and delivery tracking"
    echo "   ✓ Webhooks for delivery events"
    echo "   ✓ React Email template support"
    echo ""

    print_status "Setup guide complete!"
    echo ""
}

# Run the script
main "$@"
