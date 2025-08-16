import { getModulesWithSegmentsUseCase } from "./modules";

export interface CourseStats {
  totalModules: number;
  totalSegments: number;
  totalVideoLength: string;
}

function parseVideoLength(length: string | null): number {
  if (!length) return 0;

  // Handle various formats: "5:30", "1:05:30", "45" (seconds), etc.
  const parts = length.split(":").map((part) => parseInt(part, 10));

  if (parts.length === 1) {
    // Just seconds
    return parts[0];
  } else if (parts.length === 2) {
    // Minutes:seconds
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // Hours:minutes:seconds
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export async function getCourseStatsUseCase(): Promise<CourseStats> {
  const modulesWithSegments = await getModulesWithSegmentsUseCase();

  const totalModules = modulesWithSegments.length;
  let totalSegments = 0;
  let totalVideoSeconds = 0;

  for (const module of modulesWithSegments) {
    totalSegments += module.segments.length;

    for (const segment of module.segments) {
      if (segment.length) {
        totalVideoSeconds += parseVideoLength(segment.length);
      }
    }
  }

  const totalVideoLength = formatTotalDuration(totalVideoSeconds);

  return {
    totalModules,
    totalSegments,
    totalVideoLength,
  };
}
