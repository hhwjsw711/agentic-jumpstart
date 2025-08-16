import { ModulesSection } from "./modules";
import { StatsSection } from "./stats";
import { EarlyAccessHero } from "./early-access-hero";
import { NewsletterForm } from "./newsletter-form";
import { FutureOfCodingSection } from "./future-of-coding";
import { ResearchSourcesSection } from "./research-sources";
import { InstructorSection } from "./instructor-section";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getSegments } from "~/data-access/segments";
import { getCourseStatsUseCase } from "~/use-cases/stats";

const getSegmentsFn = createServerFn().handler(async () => {
  const segments = await getSegments();
  return segments;
});

const getStatsFn = createServerFn().handler(async () => {
  const stats = await getCourseStatsUseCase();
  return stats;
});

export function EarlyAccessSection() {
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
      {/* Hero Section with Newsletter Form */}
      <EarlyAccessHero>
        <NewsletterForm />
      </EarlyAccessHero>

      {/* Future of Coding Section */}
      <FutureOfCodingSection />

      {/* Course Stats Section */}
      {stats && <StatsSection stats={stats} />}

      {/* Research Sources Section */}
      <ResearchSourcesSection />

      {/* Course Preview Section */}
      {segments.length > 0 && (
        <div className="opacity-80">
          <ModulesSection segments={segments} isDisabled={true} />
        </div>
      )}

      {/* Instructor Section */}
      <InstructorSection />
    </>
  );
}
