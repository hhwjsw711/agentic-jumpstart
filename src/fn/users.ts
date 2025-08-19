import { createServerFn } from "@tanstack/react-start";
import { unauthenticatedMiddleware } from "~/lib/auth";
import { getProfile } from "~/data-access/profiles";
import { getCurrentUser } from "~/utils/session";

export const getUserProfileFn = createServerFn({
  method: "GET",
})
  .middleware([unauthenticatedMiddleware])
  .handler(async ({ context }) => {
    if (!context.userId) {
      return null;
    }
    return getProfile(context.userId);
  });

export const getUserInfoFn = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  return { user };
});
