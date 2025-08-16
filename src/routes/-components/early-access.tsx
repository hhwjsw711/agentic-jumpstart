import { useNewsletterSubscription } from "~/hooks/use-newsletter-subscription";
import { Button } from "~/components/ui/button";
import { ModulesSection } from "./modules";
import { StatsSection } from "./stats";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getSegments } from "~/data-access/segments";
import { getCourseStatsUseCase } from "~/use-cases/stats";
import { Play, Users, Award, Zap, Brain, Rocket } from "lucide-react";
import {
  ScrollAnimation,
  ScrollScale,
  ScrollFadeIn,
} from "~/components/scroll-animation";

const getSegmentsFn = createServerFn().handler(async () => {
  const segments = await getSegments();
  return segments;
});

const getStatsFn = createServerFn().handler(async () => {
  const stats = await getCourseStatsUseCase();
  return stats;
});

export function EarlyAccessSection() {
  const { email, setEmail, isSubmitted, isLoading, handleSubmit } =
    useNewsletterSubscription();

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: getSegmentsFn,
  });

  const { data: stats } = useQuery({
    queryKey: ["course-stats"],
    queryFn: getStatsFn,
  });

  return (
    <>
      {/* Original Early Access Hero Section */}
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

            {isSubmitted ? (
              <ScrollScale delay={0.5}>
                <div className="relative">
                  {/* Success card with glass morphism */}
                  <div className="relative bg-white/10 dark:bg-theme-500/10 backdrop-blur-md border border-theme-200/50 dark:border-theme-500/30 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
                    {/* Glow effect behind card */}
                    <div className="absolute inset-0 bg-theme-500/10 blur-3xl rounded-full"></div>

                    <div className="relative">
                      <div className="mb-4">
                        <div className="relative inline-block">
                          <svg
                            className="w-16 h-16 mx-auto text-theme-500 dark:text-theme-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {/* Icon glow */}
                          <div className="absolute inset-0 bg-theme-500/20 blur-xl"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-semibold text-theme-600 dark:text-theme-400 mb-2">
                        You're on the list!
                      </h3>
                      <p className="text-muted-foreground">
                        We'll notify you as soon as we're ready to launch.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollScale>
            ) : (
              <ScrollAnimation direction="up" delay={0.5}>
                <form
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto relative"
                >
                  {/* Form glow effect */}
                  <div className="absolute inset-0 bg-theme-500/5 blur-3xl"></div>

                  <div className="relative flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-3 h-14 text-lg rounded-lg bg-white/80 dark:bg-background/80 backdrop-blur-sm text-foreground border border-theme-200/50 dark:border-border/50 focus:outline-none focus:border-theme-500 focus:ring-2 focus:ring-theme-500/30 transition-all duration-300 hover:border-theme-400/50"
                      required
                      autoFocus
                    />
                    <Button
                      type="submit"
                      className="px-8 h-14 text-lg font-medium bg-gradient-to-r from-theme-500 to-theme-600 hover:from-theme-600 hover:to-theme-700 transition-all duration-300 shadow-lg hover:shadow-theme-500/25"
                      disabled={isLoading}
                    >
                      {isLoading ? "Joining..." : "Join Waitlist"}
                    </Button>
                  </div>
                </form>
              </ScrollAnimation>
            )}

            <ScrollFadeIn delay={0.6}>
              <div className="mt-16 relative">
                {/* Stats container with glass morphism */}
                <div className="group relative bg-white/5 dark:bg-theme-500/5 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 rounded-2xl p-6 transition-all duration-500 hover:bg-white/10 dark:hover:bg-theme-500/10 hover:shadow-2xl hover:shadow-theme-500/20">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

                  {/* Animated background glyphs */}
                  <div className="absolute top-3 left-3 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <svg
                      className="w-8 h-8 text-theme-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>

                  <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                    <svg
                      className="w-8 h-8 text-theme-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        className="animate-ping"
                      />
                    </svg>
                  </div>

                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-5 group-hover:opacity-15 transition-all duration-600 group-hover:scale-110 group-hover:translate-y-1">
                    <svg
                      className="w-8 h-8 text-theme-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        className="animate-bounce"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center justify-center gap-8 text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent group-hover:from-theme-400 group-hover:to-theme-500 transition-all duration-300">
                        500+
                      </div>
                      <div className="text-sm group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300">
                        People waiting
                      </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent group-hover:via-theme-400 transition-colors duration-300" />
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent group-hover:from-theme-400 group-hover:to-theme-500 transition-all duration-300">
                        Q3 2025
                      </div>
                      <div className="text-sm group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300">
                        Expected launch
                      </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent group-hover:via-theme-400 transition-colors duration-300" />
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent group-hover:from-theme-400 group-hover:to-theme-500 transition-all duration-300">
                        100%
                      </div>
                      <div className="text-sm group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300">
                        Worth the wait
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>

        {/* Bottom gradient divider */}
        <div className="section-divider-glow-bottom"></div>
      </div>

      {/* Future of Coding Section */}
      <section className="relative w-full py-24">
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <ScrollAnimation direction="down" delay={0}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-theme-50/50 dark:bg-background/20 backdrop-blur-sm border border-theme-200 dark:border-border/50 text-theme-600 dark:text-theme-400 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-theme-500 dark:bg-theme-400 rounded-full mr-2 animate-pulse"></span>
                The Revolution is Here
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={0.1}>
              <h2 className="text-6xl leading-tight mb-8">
                Coding is <span className="text-theme-400">Evolving</span>,
                Embrace{" "}
                <span className="text-theme-400">Agentic Programming</span>{" "}
              </h2>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={0.2}>
              <p className="text-description mb-12 max-w-4xl mx-auto text-lg">
                The era of manual coding is transforming. AI-powered development
                isn't just a trend—it's the future. While traditional developers
                spend hours debugging and writing boilerplate, agentic coders
                leverage AI models like Claude Sonnet 3.5 and Claude Opus to
                build complex applications in minutes, not days.
              </p>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 items-stretch">
            <ScrollScale delay={0.3}>
              <div className="group relative h-full bg-white/10 dark:bg-theme-500/10 backdrop-blur-md border-2 border-gray-300 dark:border-gray-600 rounded-2xl p-8 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/15 dark:hover:bg-theme-500/15 hover:shadow-2xl hover:shadow-theme-500/20">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-theme-500/0 via-theme-500/10 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                {/* Animated background glyph */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <svg
                    className="w-16 h-16 text-theme-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 2.05v2.02c4.39.54 7.5 4.53 6.96 8.92-.39 3.18-2.34 5.13-5.52 5.52-4.39.54-8.38-2.57-8.92-6.96S7.1 3.05 11.49 2.51c.17-.02.34-.03.51-.03V2.05c-5.04.5-9 4.76-8.5 9.8.5 5.04 4.76 9 9.8 8.5s9-4.76 8.5-9.8c-.39-3.93-3.57-7.11-7.5-7.5z" />
                    <circle cx="12" cy="12" r="3" className="animate-pulse" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-theme-500/20 flex items-center justify-center mb-6 group-hover:bg-theme-500/30 transition-all duration-300">
                    <Zap className="w-8 h-8 text-theme-500 group-hover:text-theme-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-theme-400 transition-colors duration-300">
                    10x Speed
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    Build entire applications in the time it takes to write a
                    single component manually. AI agents handle the
                    implementation while you focus on architecture and business
                    logic.
                  </p>
                </div>
              </div>
            </ScrollScale>

            <ScrollScale delay={0.4}>
              <div className="group relative h-full bg-white/10 dark:bg-theme-500/10 backdrop-blur-md border-2 border-gray-300 dark:border-gray-600 rounded-2xl p-8 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/15 dark:hover:bg-theme-500/15 hover:shadow-2xl hover:shadow-theme-500/20">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-theme-500/0 via-theme-500/10 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                {/* Animated background glyph */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                  <svg
                    className="w-16 h-16 text-theme-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      className="animate-pulse"
                    />
                    <circle cx="12" cy="8" r="2" className="animate-bounce" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-theme-500/20 flex items-center justify-center mb-6 group-hover:bg-theme-500/30 transition-all duration-300">
                    <Brain className="w-8 h-8 text-theme-500 group-hover:text-theme-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-theme-400 transition-colors duration-300">
                    AI-First Mindset
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    Learn to think in terms of agents and systems. Direct AI to
                    solve complex problems while maintaining full control over
                    the architecture and quality of your code.
                  </p>
                </div>
              </div>
            </ScrollScale>

            <ScrollScale delay={0.5}>
              <div className="group relative h-full bg-white/10 dark:bg-theme-500/10 backdrop-blur-md border-2 border-gray-300 dark:border-gray-600 rounded-2xl p-8 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/15 dark:hover:bg-theme-500/15 hover:shadow-2xl hover:shadow-theme-500/20">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-theme-500/0 via-theme-500/10 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                {/* Animated background glyph */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-20 transition-all duration-700 group-hover:scale-125 group-hover:translate-y-2">
                  <svg
                    className="w-16 h-16 text-theme-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      className="animate-pulse"
                    />
                    <path
                      d="M12 6l1.5 3L17 9.5l-2.5 2.5L15 16l-3-1.5L9 16l.5-4L7 9.5l3.5-.5L12 6z"
                      className="animate-ping"
                    />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-theme-500/20 flex items-center justify-center mb-6 group-hover:bg-theme-500/30 transition-all duration-300">
                    <Rocket className="w-8 h-8 text-theme-500 group-hover:text-theme-400 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-theme-400 transition-colors duration-300">
                    Ship Faster
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    Deploy production-ready applications in days, not months.
                    Let AI handle the tedious parts while you innovate and
                    create value for your users.
                  </p>
                </div>
              </div>
            </ScrollScale>
          </div>

          <ScrollAnimation direction="up" delay={0.6}>
            <div className="text-center">
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Companies are already adopting agentic coding practices.
                Developers who master these tools today will lead the teams of
                tomorrow. Don't get left behind in the AI revolution.
              </p>
            </div>
          </ScrollAnimation>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="section-divider-glow-bottom"></div>
      </section>

      {/* Course Stats Section */}
      {stats && <StatsSection stats={stats} />}

      {/* Research Sources Section */}
      <section className="relative py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <ScrollAnimation direction="up" delay={0}>
              <h2 className="text-4xl font-bold mb-5">
                The <span className="text-theme-400">Evidence</span> is Clear
              </h2>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.1}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Agentic coding isn't just hype—it's the proven future of
                software development. Here's the research that shows why every
                developer needs to adapt now.
              </p>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Animated background glyph */}
              <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-xl text-green-600 dark:text-green-400 group-hover:text-green-500 transition-colors duration-300">
                  GitHub's Game-Changing Study
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  <strong className="text-lg">26% productivity boost</strong> in
                  a rigorous trial with 4,000+ developers. This isn't
                  speculation—it's the new reality of coding with AI.
                </p>
                <a
                  href="https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-theme-500 hover:underline break-all"
                >
                  See the Research That Changed Everything →
                </a>
              </div>
            </div>

            <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Animated background glyph */}
              <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-xl text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors duration-300">
                  McKinsey's Future Forecast
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  <strong className="text-lg">2x faster development</strong>{" "}
                  while maintaining code quality. The consulting giant confirms:
                  AI-powered coding is the competitive advantage.
                </p>
                <a
                  href="https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/unleashing-developer-productivity-with-generative-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-theme-500 hover:underline break-all"
                >
                  McKinsey's AI Productivity Report →
                </a>
              </div>
            </div>

            <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Animated background glyph */}
              <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-45">
                <svg
                  className="w-12 h-12 text-purple-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    className="animate-bounce"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-xl text-purple-600 dark:text-purple-400 group-hover:text-purple-500 transition-colors duration-300">
                  Developer Consensus 2024
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  <strong className="text-lg">76% of developers</strong> already
                  use AI tools, with 81% reporting measurable productivity
                  gains. The industry has spoken.
                </p>
                <a
                  href="https://survey.stackoverflow.co/2024/ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-theme-500 hover:underline break-all"
                >
                  2024 Developer Survey Results →
                </a>
              </div>
            </div>

            <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Animated background glyph */}
              <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-700 group-hover:scale-125 group-hover:translate-x-1">
                <svg
                  className="w-12 h-12 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    className="animate-ping"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-xl text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors duration-300">
                  Amazon's Productivity Proof
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  <strong className="text-lg">
                    57% faster task completion
                  </strong>{" "}
                  in controlled studies. When Amazon validates AI coding tools,
                  you know they're here to stay.
                </p>
                <a
                  href="https://aws.amazon.com/awstv/watch/f4551b7cb8c/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-theme-500 hover:underline break-all"
                >
                  AWS Research Validation →
                </a>
              </div>
            </div>

            <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Animated background glyph */}
              <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-xl text-red-600 dark:text-red-400 group-hover:text-red-500 transition-colors duration-300">
                  Enterprise Success Stories
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  <strong className="text-lg">40% productivity gain</strong> at
                  Palo Alto Networks with 2,000 developers. Real companies, real
                  results, real competitive advantage.
                </p>
                <a
                  href="https://aws.amazon.com/partners/success/palo-alto-networks-anthropic-sourcegraph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-theme-500 hover:underline break-all"
                >
                  Enterprise AI Success Cases →
                </a>
              </div>
            </div>

            <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

              {/* Animated background glyph */}
              <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-600 group-hover:scale-110 group-hover:rotate-90">
                <svg
                  className="w-12 h-12 text-teal-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-xl text-teal-600 dark:text-teal-400 group-hover:text-teal-500 transition-colors duration-300">
                  Claude's Massive Scale
                </h3>
                <p className="text-base text-muted-foreground mb-5">
                  <strong className="text-lg">115,000 developers</strong>{" "}
                  processing 195 million lines weekly. This is the largest AI
                  coding experiment in history—and it's working.
                </p>
                <a
                  href="https://www.anthropic.com/research/impact-software-development"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-theme-500 hover:underline break-all"
                >
                  Anthropic's Economic Impact Study →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-base text-muted-foreground">
              <strong className="text-lg">The future is here.</strong> These
              aren't predictions—they're proven results from 2024. Developers
              who adapt to agentic coding now will lead the industry tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* Course Preview Section */}
      {segments.length > 0 && (
        <div className="opacity-80">
          <ModulesSection segments={segments} isDisabled={true} />
        </div>
      )}

      {/* Instructor Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 hero-background-ai opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-theme-50/50 dark:bg-background/20 backdrop-blur-sm border border-theme-200 dark:border-border/50 text-theme-600 dark:text-theme-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-theme-500 dark:bg-theme-400 rounded-full mr-2 animate-pulse"></span>
              Your Instructor
            </div>

            {/* Profile Picture with Gradient Background */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-theme-400 via-theme-500 to-theme-600 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-theme-400 via-theme-500 to-theme-600 rounded-2xl p-1">
                  <img
                    src="/cody.png"
                    alt="Cody - Your Instructor"
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-5xl font-bold mb-6">
              Learn from a{" "}
              <span className="text-theme-400">
                <br />
                Experienced Web Developer
              </span>
            </h2>
          </div>

          <div className="bg-white/10 dark:bg-theme-500/10 backdrop-blur-md border border-theme-200/50 dark:border-theme-500/30 rounded-3xl p-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">WebDevCody</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Cody is the creator behind{" "}
                  <a
                    href="https://youtube.com/@WebDevCody"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-500 hover:text-theme-400 underline"
                  >
                    WebDevCody
                  </a>
                  , one of the most prominent programming education channels on
                  YouTube with over{" "}
                  <span className="font-bold text-theme-500">
                    260,000 subscribers
                  </span>{" "}
                  and more than{" "}
                  <span className="font-bold text-theme-500">1,100 videos</span>{" "}
                  teaching coding concepts.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  With over <span className="font-bold">12 years</span> of
                  professional web development experience, Cody has witnessed
                  firsthand the transformation from traditional coding to
                  AI-assisted development. He's been at the forefront of the
                  agentic coding revolution, using tools like Cursor IDE and
                  Claude to dramatically accelerate development workflows.
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  Through his extensive teaching experience and real-world
                  application of agentic coding techniques, Cody has developed a
                  unique approach to help developers transition from traditional
                  programming to becoming 10x more productive with AI-powered
                  tools.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://youtube.com/@WebDevCody"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    YouTube Channel
                  </a>
                  <a
                    href="https://webdevcody.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-theme-600 hover:bg-theme-700 text-white rounded-lg transition-colors"
                  >
                    Personal Website
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group relative bg-white/10 dark:bg-background/20 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/15 dark:hover:bg-background/30 hover:shadow-2xl hover:shadow-theme-500/20">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

                  {/* Animated background glyph */}
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <svg
                      className="w-8 h-8 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-theme-500/20 flex items-center justify-center group-hover:bg-theme-500/30 transition-all duration-300">
                      <Users className="w-6 h-6 text-theme-500 group-hover:text-theme-400 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <div className="text-2xl font-bold group-hover:text-theme-500 transition-colors duration-300">
                        260,000+
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        YouTube Subscribers
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white/10 dark:bg-background/20 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/15 dark:hover:bg-background/30 hover:shadow-2xl hover:shadow-theme-500/20">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

                  {/* Animated background glyph */}
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-15 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                    <svg
                      className="w-8 h-8 text-theme-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" className="animate-pulse" />
                      <circle cx="12" cy="12" r="2" className="animate-ping" />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-theme-500/20 flex items-center justify-center group-hover:bg-theme-500/30 transition-all duration-300">
                      <Play className="w-6 h-6 text-theme-500 group-hover:text-theme-400 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <div className="text-2xl font-bold group-hover:text-theme-500 transition-colors duration-300">
                        1,100+
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        Educational Videos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white/10 dark:bg-background/20 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/15 dark:hover:bg-background/30 hover:shadow-2xl hover:shadow-theme-500/20">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

                  {/* Animated background glyph */}
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-15 transition-all duration-600 group-hover:scale-110 group-hover:rotate-45">
                    <svg
                      className="w-8 h-8 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        className="animate-bounce"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-theme-500/20 flex items-center justify-center group-hover:bg-theme-500/30 transition-all duration-300">
                      <Award className="w-6 h-6 text-theme-500 group-hover:text-theme-400 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <div className="text-2xl font-bold group-hover:text-theme-500 transition-colors duration-300">
                        12+ Years
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        Industry Experience
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative text-center p-6 bg-gradient-to-r from-theme-500/10 to-theme-600/10 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:from-theme-500/15 hover:to-theme-600/15 hover:shadow-2xl hover:shadow-theme-500/20">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/10 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

                  {/* Animated background glyph */}
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <svg
                      className="w-6 h-6 text-theme-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <p className="text-lg italic text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">
                      "Agentic coding isn't hype or a bubble, this is a paradigm
                      shift and it's here to stay."
                    </p>
                    <p className="text-sm text-theme-500 mt-2 group-hover:text-theme-400 transition-colors duration-300">
                      - WebDevCody
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
