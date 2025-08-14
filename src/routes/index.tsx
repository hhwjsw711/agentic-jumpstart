import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "./-components/hero";
import { ModulesSection } from "./-components/modules";
import { PricingSection } from "./-components/pricing";
import { FAQSection } from "./-components/faq";
import { createServerFn } from "@tanstack/react-start";
import { getSegmentsUseCase } from "~/use-cases/segments";
import { useNewsletterSubscription } from "~/hooks/use-newsletter-subscription";
import { Button } from "~/components/ui/button";
import { publicEnv } from "~/utils/env-public";
import { useToast } from "~/hooks/use-toast";
import { Rocket } from "lucide-react";
import { TestimonialsSection } from "./-components/testimonials";

const loaderFn = createServerFn().handler(async () => {
  const segments = await getSegmentsUseCase();
  return { segments };
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [segments] = await Promise.all([loaderFn()]);
    return { ...segments };
  },
});

function Home() {
  const { segments } = Route.useLoaderData();

  if (publicEnv.VITE_EARLY_ACCESS_MODE) {
    return <EarlyAccessLanding />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ModulesSection segments={segments} />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
}

function EarlyAccessLanding() {
  const { email, setEmail, isSubmitted, isLoading, error, handleSubmit } =
    useNewsletterSubscription();
  const { toast } = useToast();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    await handleSubmit(e);
    toast({
      title: "Thank you!",
      description:
        "We will let you know when the course is ready — looking forward to teach you.",
    });
  };

  return (
    <section className="relative w-full py-12 overflow-hidden">
      <div className="absolute inset-0 hero-background-ai"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-theme-500/5 dark:via-theme-950/20 to-transparent"></div>
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="circuit-pattern absolute inset-0"></div>
      </div>
      <div className="floating-elements">
        <div className="floating-element-1"></div>
        <div className="floating-element-2"></div>
        <div className="floating-element-3"></div>
        <div className="floating-element-small top-10 right-10"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
          <img
            src="/logo.png"
            alt="Agentic Jumpstart logo"
            className="h-16 md:h-20 w-auto mx-auto drop-shadow-[0_0_18px_rgba(0,172,193,0.25)]"
          />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            We are coming soon
          </h1>
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Agentic Jumpstart
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
              Build real, production-ready AI agents and automation. Learn
              system design for agents, tool integrations, memory, planning, and
              robust evaluation — by shipping projects end to end.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="w-full max-w-xl mx-auto flex items-stretch gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 px-4 py-3 rounded-md bg-background text-foreground border border-border focus:outline-none focus:border-theme-500"
              required
            />
            <Button
              type="submit"
              className="h-12 px-6 btn-gradient"
              disabled={isLoading}
            >
              {isLoading ? "Subscribing..." : "Notify me"}
            </Button>
          </form>

          {isSubmitted && (
            <div className="w-full max-w-xl mx-auto rounded-lg border border-theme-200 dark:border-theme-500/20 bg-theme-100/40 dark:bg-theme-500/10 p-4 text-left shadow-[0_0_20px_rgba(0,172,193,0.15)]">
              <p className="text-sm">
                We will let you know when the course is ready — looking forward
                to teach you.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 max-w-xl mx-auto">{error}</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      <div className="section-divider-glow-bottom"></div>
    </section>
  );
}
