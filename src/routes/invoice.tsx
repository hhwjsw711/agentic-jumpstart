import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { assertAuthenticatedFn } from "~/fn/auth";
import { getMyInvoiceFn } from "~/fn/purchases";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { COMPANY_ADDRESS, COURSE_CONFIG } from "~/config";
import { DownloadInvoiceButton } from "./-components/invoice/download-invoice-button";
import {
  formatCurrency,
  formatInvoiceDate,
  formatInvoiceNumber,
} from "./-components/invoice/invoice-helpers";

const invoiceQueryOptions = queryOptions({
  queryKey: ["invoice", "me"],
  queryFn: () => getMyInvoiceFn(),
  retry: false,
});

export const Route = createFileRoute("/invoice")({
  beforeLoad: () => assertAuthenticatedFn(),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(invoiceQueryOptions),
  component: InvoicePage,
  errorComponent: NoPurchaseState,
});

function InvoicePage() {
  const { data } = useSuspenseQuery(invoiceQueryOptions);
  const { purchase, billTo } = data;
  const invoiceNumber = formatInvoiceNumber(purchase);
  const hasDiscount = purchase.amountDiscount > 0;

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-nowrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="w-fit shrink-0">
            <Link to="/settings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to settings
            </Link>
          </Button>
          <DownloadInvoiceButton
            data={data}
            productDescription={COURSE_CONFIG.DESCRIPTION}
          />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-card">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-theme-600" />
                  {COMPANY_ADDRESS.NAME}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {COMPANY_ADDRESS.LINE1}
                </p>
                <p className="text-sm text-muted-foreground">
                  {COMPANY_ADDRESS.CITY}, {COMPANY_ADDRESS.STATE}{" "}
                  {COMPANY_ADDRESS.ZIP}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold tracking-widest text-theme-600">
                  INVOICE
                </p>
                <dl className="mt-4 space-y-1 text-sm">
                  <div>
                    <dt className="uppercase text-xs tracking-wider text-muted-foreground">
                      Invoice #
                    </dt>
                    <dd className="font-semibold">{invoiceNumber}</dd>
                  </div>
                  <div>
                    <dt className="uppercase text-xs tracking-wider text-muted-foreground">
                      Issued
                    </dt>
                    <dd className="font-semibold">
                      {formatInvoiceDate(purchase.purchasedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="uppercase text-xs tracking-wider text-muted-foreground mb-1">
                  Bill To
                </p>
                <p className="font-semibold text-base">{billTo.name}</p>
                <p className="text-sm text-muted-foreground">{billTo.email}</p>
              </div>
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PAID
              </span>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left uppercase text-xs tracking-wider text-muted-foreground">
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold text-center w-16">Qty</th>
                    <th className="p-3 font-semibold text-right w-32">
                      Unit Price
                    </th>
                    <th className="p-3 font-semibold text-right w-32">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <p className="font-semibold">{purchase.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {COURSE_CONFIG.DESCRIPTION}
                      </p>
                    </td>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right">
                      {formatCurrency(
                        purchase.amountSubtotal,
                        purchase.currency
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(
                        purchase.amountSubtotal,
                        purchase.currency
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <dl className="w-full sm:w-72 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">
                    {formatCurrency(
                      purchase.amountSubtotal,
                      purchase.currency
                    )}
                  </dd>
                </div>
                {hasDiscount ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="font-medium">
                      -
                      {formatCurrency(
                        purchase.amountDiscount,
                        purchase.currency
                      )}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t pt-2 text-base">
                  <dt className="font-semibold">Total Paid</dt>
                  <dd className="font-bold text-theme-600">
                    {formatCurrency(purchase.amountTotal, purchase.currency)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
              <p>Payment method: Card via Stripe</p>
              <p className="break-all">
                Reference: {purchase.stripeSessionId}
              </p>
              <p>Thank you for your purchase.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NoPurchaseState() {
  return (
    <div className="min-h-screen bg-muted/30 py-20 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              No receipt on file
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We couldn't find a purchase associated with your account yet. If
              you just completed checkout, give it a minute and refresh.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/settings">Back to settings</Link>
              </Button>
              <Button asChild>
                <Link to="/purchase">View pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
