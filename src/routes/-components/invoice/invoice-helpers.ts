import type { Purchase } from "~/db/schema";

export function formatInvoiceNumber(purchase: Pick<Purchase, "id">): string {
  return `INV-${String(purchase.id).padStart(6, "0")}`;
}

export function formatCurrency(amountInCents: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    minimumFractionDigits: 2,
  });
  return formatter.format(amountInCents / 100);
}

export function formatInvoiceDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
