import { createServerFn } from "@tanstack/react-start";
import { env } from "~/utils/env";

export const checkEarlyAccessFn = createServerFn().handler(async () => {
  return { earlyAccessEnabled: env.EARLY_ACCESS_MODE };
});
