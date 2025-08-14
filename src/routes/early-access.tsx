import { createFileRoute } from "@tanstack/react-router";
import { useNewsletterSubscription } from "~/hooks/use-newsletter-subscription";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/early-access")({
  component: EarlyAccessPage,
});

function EarlyAccessPage() {
  const { email, setEmail, isSubmitted, isLoading, handleSubmit } =
    useNewsletterSubscription();

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
          
          <div className="mb-12">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-theme-50/50 dark:bg-background/20 backdrop-blur-sm border border-theme-200 dark:border-border/50 text-theme-600 dark:text-theme-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-theme-500 dark:bg-theme-400 rounded-full mr-2 animate-pulse"></span>
              Early Access Registration
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent animate-gradient">
              Coming Soon
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Master the future of coding with AI
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Join our exclusive waiting list to be the first to access our revolutionary course on agentic programming and AI-powered development.
            </p>
          </div>

          {isSubmitted ? (
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
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
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
          )}

          <div className="mt-16 relative">
            {/* Stats container with glass morphism */}
            <div className="relative bg-white/5 dark:bg-theme-500/5 backdrop-blur-sm border border-theme-200/20 dark:border-theme-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-8 text-muted-foreground">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm">People waiting</div>
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent">Q1 2025</div>
                  <div className="text-sm">Expected launch</div>
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-theme-500 to-theme-600 dark:from-theme-400 dark:to-theme-500 bg-clip-text text-transparent">100%</div>
                  <div className="text-sm">Worth the wait</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient divider */}
      <div className="section-divider-glow-bottom"></div>
    </div>
  );
}