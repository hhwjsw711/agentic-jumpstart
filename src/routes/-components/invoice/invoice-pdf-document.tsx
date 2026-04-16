import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { COMPANY_ADDRESS } from "~/config";
import type { InvoiceData } from "~/use-cases/purchases";
import {
  formatCurrency,
  formatInvoiceDate,
  formatInvoiceNumber,
} from "./invoice-helpers";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  companyLine: {
    color: "#475569",
    marginBottom: 2,
  },
  invoiceMetaBlock: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginBottom: 10,
    color: "#0891b2",
  },
  metaLabel: {
    color: "#64748b",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaValue: {
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  billTo: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b",
    marginBottom: 6,
  },
  billToName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 2,
  },
  billToEmail: {
    color: "#475569",
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  colDescription: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1.2, textAlign: "right" },
  colAmount: { flex: 1.2, textAlign: "right" },
  tableHeaderText: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
  },
  productName: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  productDescription: {
    color: "#64748b",
    fontSize: 9,
  },
  totalsBlock: {
    alignSelf: "flex-end",
    width: "50%",
    marginBottom: 32,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsRowGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  totalsLabel: { color: "#475569" },
  totalsValue: { fontFamily: "Helvetica-Bold" },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#0891b2" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ecfdf5",
    color: "#047857",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    borderRadius: 4,
    marginBottom: 24,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    color: "#64748b",
    fontSize: 9,
    textAlign: "center",
  },
});

type Props = {
  data: InvoiceData;
  productDescription?: string;
};

export function InvoicePdfDocument({ data, productDescription }: Props) {
  const { purchase, billTo } = data;
  const invoiceNumber = formatInvoiceNumber(purchase);
  const quantity = 1;
  const unitPrice = purchase.amountSubtotal / quantity;

  return (
    <Document
      title={`Invoice ${invoiceNumber}`}
      author={COMPANY_ADDRESS.NAME}
      subject={`Receipt for ${purchase.productName}`}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{COMPANY_ADDRESS.NAME}</Text>
            <Text style={styles.companyLine}>{COMPANY_ADDRESS.LINE1}</Text>
            <Text style={styles.companyLine}>
              {COMPANY_ADDRESS.CITY}, {COMPANY_ADDRESS.STATE}{" "}
              {COMPANY_ADDRESS.ZIP}
            </Text>
          </View>
          <View style={styles.invoiceMetaBlock}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.metaLabel}>Invoice #</Text>
            <Text style={styles.metaValue}>{invoiceNumber}</Text>
            <Text style={styles.metaLabel}>Issued</Text>
            <Text style={styles.metaValue}>
              {formatInvoiceDate(purchase.purchasedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.billToName}>{billTo.name}</Text>
          <Text style={styles.billToEmail}>{billTo.email}</Text>
        </View>

        <Text style={styles.badge}>PAID</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>
              Amount
            </Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text style={styles.productName}>{purchase.productName}</Text>
              {productDescription ? (
                <Text style={styles.productDescription}>
                  {productDescription}
                </Text>
              ) : null}
            </View>
            <Text style={styles.colQty}>{quantity}</Text>
            <Text style={styles.colUnit}>
              {formatCurrency(unitPrice, purchase.currency)}
            </Text>
            <Text style={styles.colAmount}>
              {formatCurrency(purchase.amountSubtotal, purchase.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              {formatCurrency(purchase.amountSubtotal, purchase.currency)}
            </Text>
          </View>
          {purchase.amountDiscount > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>
                -{formatCurrency(purchase.amountDiscount, purchase.currency)}
              </Text>
            </View>
          ) : null}
          <View style={styles.totalsRowGrand}>
            <Text style={styles.grandLabel}>Total Paid</Text>
            <Text style={styles.grandValue}>
              {formatCurrency(purchase.amountTotal, purchase.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Payment processed securely by Stripe. Reference: {purchase.stripeSessionId}
          </Text>
          <Text>Thank you for your purchase.</Text>
        </View>
      </Page>
    </Document>
  );
}
