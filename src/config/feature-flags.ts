/**
 * Feature Flags Configuration
 * Single source of truth for all feature flag definitions
 */

import {
  Shield,
  Bot,
  Sparkles,
  Package,
  DollarSign,
  FileText,
  Newspaper,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** All feature flag keys */
export const FLAG_KEYS = [
  "EARLY_ACCESS_MODE",
  "AGENTS_FEATURE",
  "ADVANCED_AGENTS_FEATURE",
  "LAUNCH_KITS_FEATURE",
  "AFFILIATES_FEATURE",
  "BLOG_FEATURE",
  "NEWS_FEATURE",
  "VIDEO_SEGMENT_CONTENT_TABS",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

/** FLAGS object for convenient access - derived from FLAG_KEYS */
export const FLAGS = Object.fromEntries(
  FLAG_KEYS.map((key) => [key, key])
) as { [K in FlagKey]: K };

/** Target modes for feature flag targeting */
export const TARGET_MODES = {
  ALL: "all",
  PREMIUM: "premium",
  NON_PREMIUM: "non_premium",
  CUSTOM: "custom",
} as const;

export type TargetMode = (typeof TARGET_MODES)[keyof typeof TARGET_MODES];

/** Fallback values for when database is not available */
export const FALLBACK_CONFIG: Record<FlagKey, boolean> = {
  EARLY_ACCESS_MODE: false,
  AGENTS_FEATURE: true,
  ADVANCED_AGENTS_FEATURE: false,
  LAUNCH_KITS_FEATURE: true,
  AFFILIATES_FEATURE: true,
  BLOG_FEATURE: true,
  NEWS_FEATURE: true,
  VIDEO_SEGMENT_CONTENT_TABS: false,
};

/** Feature flag UI configuration */
export interface FeatureFlagUIConfig {
  key: FlagKey;
  title: string;
  description: string;
  icon: LucideIcon;
  dependsOn?: FlagKey[];
  /** If true, this flag is hidden from the admin UI */
  hidden?: boolean;
}

export const FEATURE_FLAGS_CONFIG: FeatureFlagUIConfig[] = [
  {
    key: "EARLY_ACCESS_MODE",
    title: "Early Access Mode",
    description: "Control whether the platform is in early access mode. When enabled, only admins can access the full site.",
    icon: Shield,
  },
  {
    key: "AGENTS_FEATURE",
    title: "Agents Feature",
    description: "Control whether the AI agents feature is available to users. When disabled, agent-related functionality will be hidden.",
    icon: Bot,
  },
  {
    key: "ADVANCED_AGENTS_FEATURE",
    title: "Advanced Agents",
    description: "Enable advanced AI agent capabilities like custom workflows and automation. Requires the base Agents feature.",
    icon: Sparkles,
    dependsOn: ["AGENTS_FEATURE"],
  },
  {
    key: "LAUNCH_KITS_FEATURE",
    title: "Launch Kits Feature",
    description: "Control whether the launch kits feature is available to users. When disabled, launch kit functionality will be hidden.",
    icon: Package,
  },
  {
    key: "AFFILIATES_FEATURE",
    title: "Affiliates Feature",
    description: "Control whether the affiliate program features are available to users. When disabled, affiliate-related functionality will be hidden.",
    icon: DollarSign,
  },
  {
    key: "BLOG_FEATURE",
    title: "Blog Feature",
    description: "Control whether the blog feature is available to users. When disabled, blog-related functionality will be hidden.",
    icon: FileText,
  },
  {
    key: "NEWS_FEATURE",
    title: "News Feature",
    description: "Control whether the news feature is available to users. When disabled, news-related functionality will be hidden.",
    icon: Newspaper,
  },
  {
    key: "VIDEO_SEGMENT_CONTENT_TABS",
    title: "Video Segment Content Tabs",
    description: "Control whether the video segment content tabs feature is available.",
    icon: FileText,
    hidden: true,
  },
];

/** Displayed flags (filters out hidden ones) */
export const DISPLAYED_FLAGS = FEATURE_FLAGS_CONFIG.filter((f) => !f.hidden);
