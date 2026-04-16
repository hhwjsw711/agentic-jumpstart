import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import type { InvoiceData } from "~/use-cases/purchases";
import { formatInvoiceNumber } from "./invoice-helpers";

type Props = {
  data: InvoiceData;
  productDescription?: string;
};

export function DownloadInvoiceButton({ data, productDescription }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./invoice-pdf-document"),
      ]);

      const blob = await pdf(
        <InvoicePdfDocument
          data={data}
          productDescription={productDescription}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const invoiceNumber = formatInvoiceNumber(data.purchase);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke on next tick so Safari has time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to generate invoice PDF:", error);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="w-fit shrink-0"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
