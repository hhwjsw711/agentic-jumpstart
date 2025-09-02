import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isAdminUseCase } from "~/use-cases/users";
import { getEarlyAccessModeUseCase } from "~/use-cases/app-settings";

export const checkEarlyAccessFn = createServerFn()
  .validator(z.void())
  .handler(async () => {
    try {
      const earlyAccessEnabled = await getEarlyAccessModeUseCase();
      return { earlyAccessEnabled };
    } catch (error) {
      console.error("Error checking early access:", error);
      return { earlyAccessEnabled: false };
    }
  });

export const shouldShowEarlyAccessFn = createServerFn()
  .validator(z.void())
  .handler(async () => {
    try {
      const earlyAccessMode = await getEarlyAccessModeUseCase();

      if (!earlyAccessMode) {
        return false;
      }

      // If early access mode is enabled, check if user is admin
      // Admins should bypass early access mode
      const isAdmin = await isAdminUseCase();
      return !isAdmin;
    } catch (error) {
      console.error("Error checking should show early access:", error);
      // Default to showing early access if there's an error
      return true;
    }
  });
