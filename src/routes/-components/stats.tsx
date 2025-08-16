import { BookOpen, Play, Clock } from "lucide-react";
import type { CourseStats } from "~/use-cases/stats";

interface StatsProps {
  stats: CourseStats;
}

export function StatsSection({ stats }: StatsProps) {
  const statsData = [
    {
      icon: BookOpen,
      value: stats.totalModules,
      label: "Modules",
      description: "Comprehensive learning modules",
    },
    {
      icon: Play,
      value: stats.totalSegments,
      label: "Video Segments",
      description: "Bite-sized video lessons",
    },
    {
      icon: Clock,
      value: stats.totalVideoLength,
      label: "Total Content",
      description: "Hours of premium content",
    },
  ];

  return (
    <section className="relative w-full py-16 overflow-hidden">
      {/* Background with theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-theme-50/10 to-theme-100/20 dark:from-background dark:via-theme-950/10 dark:to-theme-900/20"></div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="circuit-pattern absolute inset-0"></div>
      </div>

      {/* Floating elements */}
      <div className="floating-elements">
        <div className="floating-element-small top-20 left-10"></div>
        <div className="floating-element-small bottom-20 right-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Course <span className="text-theme-400">Overview</span>
            </h2>
            <p className="text-description max-w-2xl mx-auto">
              Comprehensive agentic coding curriculum designed to transform your
              development workflow
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group relative">
                  {/* Card with glass morphism and glow effect */}
                  <div className="relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-theme-200/60 dark:border-theme-500/30 shadow-elevation-2 transition-all duration-300 hover:shadow-glow-cyan hover:border-theme-400/80 hover:-translate-y-1 p-8">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-theme-500/5 to-theme-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

                    {/* Icon */}
                    <div className="relative mb-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-theme-500/10 dark:bg-theme-400/20 flex items-center justify-center group-hover:bg-theme-500/20 dark:group-hover:bg-theme-400/30 transition-colors duration-300">
                        <Icon className="w-8 h-8 text-theme-500 dark:text-theme-400 group-hover:text-theme-600 dark:group-hover:text-theme-300 transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-center mb-2">
                      <div className="text-4xl font-bold text-foreground group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors duration-300">
                        {stat.value}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="text-center mb-3">
                      <div className="text-xl font-semibold text-theme-600 dark:text-theme-400">
                        {stat.label}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {stat.description}
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-theme-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-theme-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      <div className="section-divider-glow-bottom"></div>
    </section>
  );
}
