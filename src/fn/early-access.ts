import { createServerFn } from "@tanstack/react-start";
import { isAdminUseCase } from "~/use-cases/users";
import { getEarlyAccessModeUseCase } from "~/use-cases/app-settings";

export const checkEarlyAccessFn = createServerFn().handler(async () => {
  const earlyAccessEnabled = await getEarlyAccessModeUseCase();
  return { earlyAccessEnabled };
});

export const shouldShowEarlyAccessFn = createServerFn().handler(async () => {
  const earlyAccessMode = await getEarlyAccessModeUseCase();
  
  if (!earlyAccessMode) {
    return false;
  }
  
  // If early access mode is enabled, check if user is admin
  // Admins should bypass early access mode
  const isAdmin = await isAdminUseCase();
  return !isAdmin;
});
