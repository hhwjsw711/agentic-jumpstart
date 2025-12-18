import { DotPattern } from "~/components/ui/background-patterns";

const researchSources = [
  {
    title: "GitHub's Game-Changing Study",
    statistic: "26% productivity boost",
    description:
      "in a rigorous trial with 4,000+ developers. This isn't speculation—it's the new reality of coding with AI.",
    link: "https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/",
    linkText: "See the Research That Changed Everything →",
    color: "green",
    glyphPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "McKinsey's Future Forecast",
    statistic: "2x faster development",
    description:
      "while maintaining code quality. The consulting giant confirms: AI-powered coding is the competitive advantage.",
    link: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/unleashing-developer-productivity-with-generative-ai",
    linkText: "McKinsey's AI Productivity Report →",
    color: "blue",
    glyphPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  },
  {
    title: "Developer Consensus 2024",
    statistic: "76% of developers",
    description:
      "already use AI tools, with 81% reporting measurable productivity gains. The industry has spoken.",
    link: "https://survey.stackoverflow.co/2024/ai",
    linkText: "2024 Developer Survey Results →",
    color: "purple",
    glyphPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  {
    title: "Amazon's Productivity Proof",
    statistic: "57% faster task completion",
    description:
      "in controlled studies. When Amazon validates AI coding tools, you know they're here to stay.",
    link: "https://aws.amazon.com/awstv/watch/f4551b7cb8c/",
    linkText: "AWS Research Validation →",
    color: "amber",
    glyphPath:
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
  {
    title: "Enterprise Success Stories",
    statistic: "40% productivity gain",
    description:
      "at Palo Alto Networks with 2,000 developers. Real companies, real results, real competitive advantage.",
    link: "https://aws.amazon.com/partners/success/palo-alto-networks-anthropic-sourcegraph/",
    linkText: "Enterprise AI Success Cases →",
    color: "red",
    glyphPath: "M20 6L9 17l-5-5",
    extraGlyph: (
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    ),
  },
  {
    title: "Claude's Massive Scale",
    statistic: "115,000 developers",
    description:
      "processing 195 million lines weekly. This is the largest AI coding experiment in history—and it's working.",
    link: "https://www.anthropic.com/research/impact-software-development",
    linkText: "Anthropic's Economic Impact Study →",
    color: "teal",
    glyphPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
];

export function ResearchSourcesSection() {
  return (
    <section className="relative py-16 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.3]">
        <DotPattern
          width={24}
          height={24}
          cx={1}
          cy={1}
          cr={1}
          className="fill-gray-400/30 dark:fill-gray-600/30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-5">
            The <span className="text-theme-400">Evidence</span> is Clear
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Agentic coding isn't just hype—it's the proven future of software
            development. Here's the research that shows why every developer
            needs to adapt now.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchSources.map((source, index) => (
            <ResearchCard key={index} {...source} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-muted-foreground">
            <strong className="text-lg">The future is here.</strong> These
            aren't predictions—they're proven results from 2024. Developers who
            adapt to agentic coding now will lead the industry tomorrow.
          </p>
        </div>
      </div>
    </section>
  );
}

interface ResearchCardProps {
  title: string;
  statistic: string;
  description: string;
  link: string;
  linkText: string;
  color: string;
  glyphPath: string;
  extraGlyph?: React.ReactNode;
}

function ResearchCard({
  title,
  statistic,
  description,
  link,
  linkText,
  color,
  glyphPath,
  extraGlyph,
}: ResearchCardProps) {
  return (
    <div className="group relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 hover:border-theme-400 dark:hover:border-theme-500 transition-all duration-500 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-theme-500/20">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-500/0 via-theme-500/8 to-theme-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

      {/* Animated background glyph */}
      <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
        <svg
          className={`w-12 h-12 text-${color}-500`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {glyphPath.includes("M") ? (
            <path
              d={glyphPath}
              stroke={glyphPath.includes("L") ? "currentColor" : undefined}
              strokeWidth={glyphPath.includes("L") ? "2" : undefined}
              fill={glyphPath.includes("L") ? "none" : "currentColor"}
            />
          ) : (
            <path d={glyphPath} />
          )}
          {extraGlyph}
        </svg>
      </div>

      <div className="relative z-10">
        <h3
          className={`font-semibold mb-4 text-xl text-${color}-600 dark:text-${color}-400 group-hover:text-${color}-500 transition-colors duration-300`}
        >
          {title}
        </h3>
        <p className="text-base text-muted-foreground mb-5">
          <strong className="text-lg">{statistic}</strong> {description}
        </p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-theme-500 hover:underline break-all"
        >
          {linkText}
        </a>
      </div>
    </div>
  );
}
