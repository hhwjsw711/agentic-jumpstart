import type Stripe from "stripe";
import { stripe } from "~/lib/stripe";
import {
  createPurchase,
  getLatestPurchaseByUserId,
} from "~/data-access/purchases";
import { getUser } from "~/data-access/users";
import { getProfile } from "~/data-access/profiles";
import { NotFoundError } from "./errors";
import { COURSE_CONFIG } from "~/config";
import type { UserId } from "./types";
import type { Purchase } from "~/db/schema";

function resolveProductName(session: Stripe.Checkout.Session): string {
  const expanded = session.line_items?.data?.[0]?.description;
  if (expanded && expanded.trim().length > 0) return expanded;
  return COURSE_CONFIG.NAME;
}

function toPaymentIntentId(
  paymentIntent: Stripe.Checkout.Session["payment_intent"]
): string | null {
  if (!paymentIntent) return null;
  if (typeof paymentIntent === "string") return paymentIntent;
  return paymentIntent.id;
}

export async function recordPurchaseFromSessionUseCase(
  session: Stripe.Checkout.Session
) {
  const userIdRaw = session.metadata?.userId;
  if (!userIdRaw) {
    throw new Error("Stripe session is missing userId metadata");
  }
  const userId = parseInt(userIdRaw, 10);
  if (Number.isNaN(userId)) {
    throw new Error(`Stripe session has invalid userId metadata: ${userIdRaw}`);
  }

  const amountTotal = session.amount_total ?? 0;
  const amountSubtotal = session.amount_subtotal ?? amountTotal;
  const amountDiscount = session.total_details?.amount_discount ?? 0;

  const purchasedAt = session.created
    ? new Date(session.created * 1000)
    : new Date();

  return createPurchase({
    userId,
    stripeSessionId: session.id,
    stripePaymentIntentId: toPaymentIntentId(session.payment_intent),
    amountSubtotal,
    amountTotal,
    amountDiscount,
    currency: session.currency ?? "usd",
    customerEmail: session.customer_email ?? session.customer_details?.email ?? null,
    productName: resolveProductName(session),
    purchasedAt,
  });
}

// Upper bound on how many historical sessions to inspect during backfill.
// Stripe Checkout sessions don't support the search API, so we iterate
// recent sessions and match on metadata.userId or customer_email.
const BACKFILL_MAX_SESSIONS = 500;

async function backfillPurchaseFromStripe(
  userId: UserId,
  email: string
): Promise<Purchase | undefined> {
  try {
    let scanned = 0;
    let match: Stripe.Checkout.Session | undefined;

    for await (const session of stripe.checkout.sessions.list({ limit: 100 })) {
      scanned += 1;
      if (session.status !== "complete") continue;

      const metadataUserId = session.metadata?.userId;
      const matchesUser =
        metadataUserId && parseInt(metadataUserId, 10) === userId;
      const matchesEmail =
        !metadataUserId &&
        (session.customer_email === email ||
          session.customer_details?.email === email);

      if (matchesUser || matchesEmail) {
        match = session;
        break;
      }

      if (scanned >= BACKFILL_MAX_SESSIONS) break;
    }

    if (!match) {
      return undefined;
    }

    const fullSession = await stripe.checkout.sessions.retrieve(match.id, {
      expand: ["line_items"],
    });

    // Ensure downstream use case sees userId metadata, even on older sessions
    const sessionWithUserId: Stripe.Checkout.Session = {
      ...fullSession,
      metadata: { ...(fullSession.metadata ?? {}), userId: String(userId) },
    };

    await recordPurchaseFromSessionUseCase(sessionWithUserId);
    return getLatestPurchaseByUserId(userId);
  } catch (error) {
    console.error(
      `[Invoice] Stripe session backfill failed for user ${userId} (${email}):`,
      error
    );
    return undefined;
  }
}

export type InvoiceData = {
  purchase: Purchase;
  billTo: {
    name: string;
    email: string;
  };
};

export async function getMyInvoiceUseCase(
  userId: UserId,
  email: string | null | undefined
): Promise<InvoiceData> {
  let purchase: Purchase | undefined = await getLatestPurchaseByUserId(userId);

  if (!purchase) {
    const user = await getUser(userId);
    if (user?.isPremium && email) {
      purchase = await backfillPurchaseFromStripe(userId, email);
    }
  }

  if (!purchase) {
    throw new NotFoundError();
  }

  const profile = await getProfile(userId);
  const user = await getUser(userId);

  const name =
    profile?.realName?.trim() ||
    profile?.displayName?.trim() ||
    user?.email ||
    "Customer";

  return {
    purchase,
    billTo: {
      name,
      email: user?.email ?? email ?? "",
    },
  };
}
