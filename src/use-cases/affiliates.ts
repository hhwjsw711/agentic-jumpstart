import { randomBytes } from "crypto";
import {
  createAffiliate,
  getAffiliateByUserId,
  getAffiliateByCode,
  createAffiliateReferral,
  updateAffiliateBalances,
  createAffiliatePayout,
  getAffiliateByStripeSession,
  updateAffiliateProfile,
  getAffiliateStats,
  getAffiliateReferrals,
  getAffiliatePayouts,
  getMonthlyAffiliateEarnings,
  getAllAffiliatesWithStats,
} from "~/data-access/affiliates";
import { ApplicationError } from "./errors";
import { AFFILIATE_CONFIG } from "~/config";

export async function registerAffiliateUseCase({
  userId,
  paymentLink,
}: {
  userId: number;
  paymentLink: string;
}) {
  // Check if user already is an affiliate
  const existingAffiliate = await getAffiliateByUserId(userId);
  if (existingAffiliate) {
    throw new ApplicationError(
      "You are already registered as an affiliate",
      "ALREADY_REGISTERED"
    );
  }

  // Validate payment link (basic validation)
  if (!paymentLink || paymentLink.length < 10) {
    throw new ApplicationError(
      "Please provide a valid payment link",
      "INVALID_PAYMENT_LINK"
    );
  }

  // Validate it's a URL
  try {
    new URL(paymentLink);
  } catch {
    throw new ApplicationError(
      "Payment link must be a valid URL",
      "INVALID_PAYMENT_LINK"
    );
  }

  // Generate unique affiliate code
  const affiliateCode = await generateUniqueAffiliateCode();

  // Create affiliate
  const affiliate = await createAffiliate({
    userId,
    affiliateCode,
    paymentLink,
    commissionRate: AFFILIATE_CONFIG.COMMISSION_RATE,
    totalEarnings: 0,
    paidAmount: 0,
    unpaidBalance: 0,
    isActive: true,
  });

  return affiliate;
}

export async function processAffiliateReferralUseCase({
  affiliateCode,
  purchaserId,
  stripeSessionId,
  amount,
  hasStripeConnect = false,
  stripeTransferId = null,
}: {
  affiliateCode: string;
  purchaserId: number;
  stripeSessionId: string;
  amount: number;
  hasStripeConnect?: boolean;
  stripeTransferId?: string | null;
}) {
  // Import database for transaction support
  const { database } = await import("~/db");
  
  return await database.transaction(async (tx) => {
    // Get affiliate by code (using the imported function which uses the main database)
    const { getAffiliateByCodeIncludingRevoked } = await import("~/data-access/affiliates");
    const affiliate = await getAffiliateByCodeIncludingRevoked(affiliateCode);
    
    if (!affiliate) {
      console.warn(`Invalid affiliate code: ${affiliateCode} for purchase ${stripeSessionId}`);
      return null;
    }

    // Check if affiliate is revoked
    if (affiliate.isRevoked) {
      console.warn(`Revoked affiliate code used: ${affiliateCode} for purchase ${stripeSessionId}`);
      return null;
    }

    // Check if affiliate is active
    if (!affiliate.isActive) {
      console.warn(`Inactive affiliate code: ${affiliateCode} for purchase ${stripeSessionId}`);
      return null;
    }

    // Check for self-referral
    if (affiliate.userId === purchaserId) {
      console.warn(`Self-referral attempted by user ${purchaserId} for session ${stripeSessionId}`);
      return null;
    }

    // Check if this session was already processed (database unique constraint also helps with race conditions)
    const existingReferral = await getAffiliateByStripeSession(stripeSessionId);
    if (existingReferral) {
      console.warn(`Duplicate Stripe session: ${stripeSessionId} already processed`);
      return null;
    }

    // Calculate commission
    const commission = Math.floor((amount * affiliate.commissionRate) / 100);

    // Create referral record
    const referral = await createAffiliateReferral({
      affiliateId: affiliate.id,
      purchaserId,
      stripeSessionId,
      amount,
      commission,
      isPaid: hasStripeConnect, // If Stripe Connect, mark as paid immediately
      stripeTransferId,
      transferStatus: hasStripeConnect ? "completed" : null,
      paymentMethod: hasStripeConnect ? "stripe_connect" : "manual",
    });

    // Update affiliate balances
    if (hasStripeConnect) {
      // For Stripe Connect, commission is already paid directly
      await updateAffiliateBalances(affiliate.id, commission, 0); // No unpaid balance
    } else {
      // For manual payments, add to unpaid balance
      await updateAffiliateBalances(affiliate.id, commission, commission);
    }

    return referral;
  });
}

export async function recordAffiliatePayoutUseCase({
  affiliateId,
  amount,
  paymentMethod,
  transactionId,
  notes,
  paidBy,
}: {
  affiliateId: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  paidBy: number;
}) {
  // Validate minimum payout
  if (amount < AFFILIATE_CONFIG.MINIMUM_PAYOUT) {
    throw new ApplicationError(
      `Minimum payout amount is $${AFFILIATE_CONFIG.MINIMUM_PAYOUT / 100}`,
      "MINIMUM_PAYOUT_NOT_MET"
    );
  }

  // Create payout record (this also updates balances and marks referrals as paid)
  const payout = await createAffiliatePayout({
    affiliateId,
    amount,
    paymentMethod,
    transactionId: transactionId || null,
    notes: notes || null,
    paidBy,
  });

  return payout;
}

export async function validateAffiliateCodeUseCase(code: string) {
  if (!code) return null;

  const { getAffiliateByCodeIncludingRevoked } = await import("~/data-access/affiliates");
  const affiliate = await getAffiliateByCodeIncludingRevoked(code);
  
  if (!affiliate) {
    return null;
  }

  // Check if affiliate is revoked
  if (affiliate.isRevoked) {
    throw new ApplicationError(
      "This affiliate code has been revoked and is no longer valid",
      "AFFILIATE_CODE_REVOKED"
    );
  }

  // Check if affiliate is inactive
  if (!affiliate.isActive) {
    return null;
  }

  return affiliate;
}

export async function updateAffiliatePaymentLinkUseCase({
  userId,
  paymentLink,
}: {
  userId: number;
  paymentLink: string;
}) {
  const affiliate = await getAffiliateByUserId(userId);
  if (!affiliate) {
    throw new ApplicationError(
      "You are not registered as an affiliate",
      "NOT_AFFILIATE"
    );
  }

  // Validate payment link
  if (!paymentLink || paymentLink.length < 10) {
    throw new ApplicationError(
      "Please provide a valid payment link",
      "INVALID_PAYMENT_LINK"
    );
  }

  try {
    new URL(paymentLink);
  } catch {
    throw new ApplicationError(
      "Payment link must be a valid URL",
      "INVALID_PAYMENT_LINK"
    );
  }

  // Update payment link in database
  return updateAffiliateProfile(affiliate.id, { paymentLink });
}

export async function getAffiliateAnalyticsUseCase(userId: number) {
  const affiliate = await getAffiliateByUserId(userId);
  if (!affiliate) {
    throw new ApplicationError(
      "You are not registered as an affiliate",
      "NOT_AFFILIATE"
    );
  }

  const [stats, referrals, payouts, monthlyEarnings] = await Promise.all([
    getAffiliateStats(affiliate.id),
    getAffiliateReferrals(affiliate.id),
    getAffiliatePayouts(affiliate.id),
    getMonthlyAffiliateEarnings(affiliate.id),
  ]);

  return {
    affiliate,
    stats,
    referrals,
    payouts,
    monthlyEarnings,
  };
}

export async function adminGetAllAffiliatesUseCase() {
  return getAllAffiliatesWithStats();
}

export async function adminToggleAffiliateStatusUseCase({
  affiliateId,
  isActive,
}: {
  affiliateId: number;
  isActive: boolean;
}) {
  return updateAffiliateProfile(affiliateId, { isActive });
}

async function generateUniqueAffiliateCode(): Promise<string> {
  let attempts = 0;
  
  while (attempts < AFFILIATE_CONFIG.AFFILIATE_CODE_RETRY_ATTEMPTS) {
    // Generate a random affiliate code
    const bytes = randomBytes(6);
    const code = bytes
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, AFFILIATE_CONFIG.AFFILIATE_CODE_LENGTH)
      .toUpperCase();

    // Ensure it's exactly the required length (pad if needed)
    const paddedCode = code.padEnd(AFFILIATE_CONFIG.AFFILIATE_CODE_LENGTH, "0");
    
    // Check if this code is already in use
    const existingAffiliate = await getAffiliateByCode(paddedCode);
    if (!existingAffiliate) {
      return paddedCode;
    }
    
    attempts++;
  }
  
  throw new ApplicationError(
    "Unable to generate unique affiliate code after multiple attempts",
    "CODE_GENERATION_FAILED"
  );
}

// Stripe Connect use cases
export async function createStripeConnectAccountUseCase(userId: number) {
  const { stripe } = await import("~/lib/stripe");
  const { updateAffiliateStripeConnect } = await import("~/data-access/affiliates");
  
  // Check if user is an affiliate
  const affiliate = await getAffiliateByUserId(userId);
  if (!affiliate) {
    throw new ApplicationError(
      "You must be registered as an affiliate first",
      "NOT_AFFILIATE"
    );
  }

  // Check if already has a Connect account
  if (affiliate.stripeConnectAccountId) {
    throw new ApplicationError(
      "You already have a Stripe Connect account",
      "ALREADY_CONNECTED"
    );
  }

  try {
    // Create Express account
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.HOST_NAME}/affiliate-dashboard?refresh=true`,
      return_url: `${process.env.HOST_NAME}/affiliate-dashboard?success=true`,
      type: "account_onboarding",
    });

    // Update affiliate with Stripe Connect info
    await updateAffiliateStripeConnect(affiliate.id, {
      stripeConnectAccountId: account.id,
      stripeConnectStatus: "pending",
      stripeConnectOnboardingUrl: accountLink.url,
      stripeConnectDetailsSubmitted: false,
      stripeConnectChargesEnabled: false,
      stripeConnectPayoutsEnabled: false,
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    throw new ApplicationError(
      "Failed to create Stripe Connect account",
      "STRIPE_CONNECT_ERROR"
    );
  }
}

export async function getStripeConnectStatusUseCase(userId: number) {
  const { stripe } = await import("~/lib/stripe");
  const { updateAffiliateStripeConnect } = await import("~/data-access/affiliates");
  
  const affiliate = await getAffiliateByUserId(userId);
  if (!affiliate) {
    throw new ApplicationError(
      "You are not registered as an affiliate",
      "NOT_AFFILIATE"
    );
  }

  if (!affiliate.stripeConnectAccountId) {
    return {
      connected: false,
      status: null,
      onboardingRequired: true,
    };
  }

  try {
    // Get current account status from Stripe
    const account = await stripe.accounts.retrieve(affiliate.stripeConnectAccountId);

    // Update our database with current status
    await updateAffiliateStripeConnect(affiliate.id, {
      stripeConnectStatus: account.details_submitted ? "complete" : "pending",
      stripeConnectDetailsSubmitted: account.details_submitted || false,
      stripeConnectChargesEnabled: account.charges_enabled || false,
      stripeConnectPayoutsEnabled: account.payouts_enabled || false,
    });

    // Create new onboarding link if still needed
    let onboardingUrl = null;
    if (!account.details_submitted) {
      const accountLink = await stripe.accountLinks.create({
        account: affiliate.stripeConnectAccountId,
        refresh_url: `${process.env.HOST_NAME}/affiliate-dashboard?refresh=true`,
        return_url: `${process.env.HOST_NAME}/affiliate-dashboard?success=true`,
        type: "account_onboarding",
      });
      onboardingUrl = accountLink.url;
    }

    return {
      connected: true,
      status: account.details_submitted ? "complete" : "pending",
      onboardingRequired: !account.details_submitted,
      onboardingUrl,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      accountId: affiliate.stripeConnectAccountId,
    };
  } catch (error) {
    console.error("Error getting Stripe Connect status:", error);
    throw new ApplicationError(
      "Failed to get Stripe Connect status",
      "STRIPE_CONNECT_ERROR"
    );
  }
}

export async function adminRevokeAffiliateUseCase({
  affiliateId,
  reason,
  revokedBy,
}: {
  affiliateId: number;
  reason: string;
  revokedBy: number;
}) {
  const { revokeAffiliate } = await import("~/data-access/affiliates");
  
  const updated = await revokeAffiliate(affiliateId, {
    reason,
    revokedBy,
  });

  return updated;
}

export async function processAffiliateRefundUseCase({
  stripeSessionId,
  refundId,
  refundAmount,
}: {
  stripeSessionId: string;
  refundId: string;
  refundAmount: number;
}) {
  const { database } = await import("~/db");
  const { createAffiliateRefund } = await import("~/data-access/affiliates");
  
  return await database.transaction(async (tx) => {
    // Find the original referral
    const existingReferral = await getAffiliateByStripeSession(stripeSessionId);
    if (!existingReferral) {
      console.warn(`No referral found for refunded session: ${stripeSessionId}`);
      return null;
    }

    const { affiliate, referral } = existingReferral;

    // Calculate commission to reverse
    const commissionRefund = Math.floor((refundAmount * affiliate.commissionRate) / 100);

    // Create refund record
    const refund = await createAffiliateRefund({
      affiliateReferralId: referral.id,
      affiliateId: affiliate.id,
      stripeRefundId: refundId,
      refundAmount,
      commissionRefund,
      stripeTransferReversalId: null, // Will be updated if we need to reverse transfer
      reversalStatus: "pending",
    });

    // Update affiliate balances to reverse the commission
    if (referral.paymentMethod === "stripe_connect") {
      // For Stripe Connect, we might need to reverse the transfer
      // This would typically be handled by Stripe automatically
      await updateAffiliateBalances(affiliate.id, -commissionRefund, 0);
    } else {
      // For manual payments, reduce unpaid balance if possible
      const currentUnpaid = Math.max(0, affiliate.unpaidBalance - commissionRefund);
      const balanceAdjustment = affiliate.unpaidBalance - currentUnpaid;
      await updateAffiliateBalances(affiliate.id, -commissionRefund, -balanceAdjustment);
    }

    // Check for refund abuse pattern
    const { checkRefundAbusePattern } = await import("~/data-access/affiliates");
    const isAbusive = await checkRefundAbusePattern(affiliate.id);
    
    if (isAbusive) {
      console.warn(`Potential refund abuse detected for affiliate ${affiliate.id}`);
      // Admin could be notified here or automatic actions taken
    }

    return refund;
  });
}
