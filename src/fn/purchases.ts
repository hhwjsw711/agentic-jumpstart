import { createServerFn } from "@tanstack/react-start";
import { authenticatedMiddleware } from "~/lib/auth";
import { getMyInvoiceUseCase } from "~/use-cases/purchases";

export const getMyInvoiceFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    return getMyInvoiceUseCase(context.userId, context.email);
  });
