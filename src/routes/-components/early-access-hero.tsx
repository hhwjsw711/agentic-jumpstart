import { ScrollAnimation, ScrollScale } from "~/components/scroll-animation";

interface EarlyAccessHeroProps {
  children: React.ReactNode;
}

export function EarlyAccessHero({ children }: EarlyAccessHeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background similar to main hero */}
      <div className="absolute inset-0 hero-background-ai"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-theme-500/5 dark:via-theme-950/20 to-transparent"></div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="circuit-pattern absolute inset-0"></div>
      </div>

      {/* Floating elements for ambiance */}
      <div className="floating-elements">
        <div className="floating-element-1"></div>
        <div className="floating-element-2"></div>
        <div className="floating-element-3"></div>
        <div className="floating-element-small top-20 right-20"></div>
        <div className="floating-element-small bottom-20 left-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo with glow effect */}
          <ScrollScale delay={0}>
            <div className="mb-8 relative inline-block group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Agentic Jumpstart"
                  className="size-24 md:size-32 mx-auto transition-transform duration-500 group-hover:scale-110"
                />
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 rounded-full bg-theme-500/20 blur-xl animate-pulse"></div>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-full bg-theme-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </ScrollScale>

          <div className="mb-12">
            {/* Badge */}
            <ScrollAnimation direction="down" delay={0.1}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-theme-50/50 dark:bg-background/20 backdrop-blur-sm border border-theme-200 dark:border-border/50 text-theme-600 dark:text-theme-400 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-theme-500 dark:bg-theme-400 rounded-full mr-2 animate-pulse"></span>
                Early Access Registration
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={0.2}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent animate-gradient leading-normal pb-1">
                Coming Soon
              </h1>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.3}>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Master the future of coding with AI—learn to build agentic
                systems that work for you.
              </p>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.4}>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Join our exclusive waiting list to be the first to access our
                groundbreaking course, designed to teach you agentic coding
                and empower you to create intelligent, autonomous software
                using the latest in AI-powered development.
              </p>
            </ScrollAnimation>
          </div>

          {children}
        </div>
      </div>

      {/* Bottom gradient divider */}
      <div className="section-divider-glow-bottom"></div>
    </div>
  );
}