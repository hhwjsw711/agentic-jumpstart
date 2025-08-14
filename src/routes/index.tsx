import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "./-components/hero";
import { ModulesSection } from "./-components/modules";
import { PricingSection } from "./-components/pricing";
import { FAQSection } from "./-components/faq";
import { createServerFn } from "@tanstack/react-start";
import { getSegmentsUseCase } from "~/use-cases/segments";
import { NewsletterSection } from "./-components/newsletter";
import { TestimonialsSection } from "./-components/testimonials";
import { EarlyAccessSection } from "./-components/early-access";
import { env } from "~/utils/env";

const loaderFn = createServerFn().handler(async () => {
  const segments = await getSegmentsUseCase();
  const earlyAccessEnabled = env.EARLY_ACCESS_MODE;
  return { segments, earlyAccessEnabled };
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [segments] = await Promise.all([loaderFn()]);
    return { ...segments };
  },
});

function Home() {
  const { segments, earlyAccessEnabled } = Route.useLoaderData();

  if (earlyAccessEnabled) {
    return <EarlyAccessSection />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      {/* <NewsletterSection /> */}
      <ModulesSection segments={segments} />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
}
