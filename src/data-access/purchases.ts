import { desc, eq } from "drizzle-orm";
import { database } from "~/db";
import { purchases, PurchaseCreate } from "~/db/schema";
import { UserId } from "~/use-cases/types";

export async function createPurchase(data: PurchaseCreate) {
  const [purchase] = await database
    .insert(purchases)
    .values(data)
    .onConflictDoNothing({ target: purchases.stripeSessionId })
    .returning();
  return purchase;
}

export async function getLatestPurchaseByUserId(userId: UserId) {
  const [purchase] = await database
    .select()
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.purchasedAt))
    .limit(1);
  return purchase;
}

export async function getPurchaseByStripeSessionId(stripeSessionId: string) {
  const [purchase] = await database
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, stripeSessionId));
  return purchase;
}
