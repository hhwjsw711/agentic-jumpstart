// This has to live in a separate file because import.meta breaks when running migrations

export const publicEnv = {
  VITE_FILE_URL: import.meta.env.VITE_FILE_URL!,
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!,
  VITE_RECAPTCHA_KEY: import.meta.env.VITE_RECAPTCHA_KEY!,
  VITE_EARLY_ACCESS_MODE: import.meta.env.VITE_EARLY_ACCESS_MODE === "true",
};
