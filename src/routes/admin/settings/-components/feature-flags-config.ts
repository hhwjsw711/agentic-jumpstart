import { Shield, Bot, Sparkles, Package, DollarSign, FileText, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FLAGS, type FlagKey } from "~/config";

export interface FeatureFlagConfig {
  key: FlagKey;
  title: string;
  description: string;
  icon: LucideIcon;
  dependsOn?: FlagKey[];
}

export const FEATURE_FLAGS_CONFIG: FeatureFlagConfig[] = [
  {
    key: FLAGS.EARLY_ACCESS_MODE,
    title: "Early Access Mode",
    description: "Control whether the platform is in early access mode. When enabled, only admins can access the full site.",
    icon: Shield,
  },
  {
    key: FLAGS.AGENTS_FEATURE,
    title: "Agents Feature",
    description: "Control whether the AI agents feature is available to users. When disabled, agent-related functionality will be hidden.",
    icon: Bot,
  },
  {
    key: FLAGS.ADVANCED_AGENTS_FEATURE,
    title: "Advanced Agents",
    description: "Enable advanced AI agent capabilities like custom workflows and automation. Requires the base Agents feature.",
    icon: Sparkles,
    dependsOn: [FLAGS.AGENTS_FEATURE],
  },
  {
    key: FLAGS.LAUNCH_KITS_FEATURE,
    title: "Launch Kits Feature",
    description: "Control whether the launch kits feature is available to users. When disabled, launch kit functionality will be hidden.",
    icon: Package,
  },
  {
    key: FLAGS.AFFILIATES_FEATURE,
    title: "Affiliates Feature",
    description: "Control whether the affiliate program features are available to users. When disabled, affiliate-related functionality will be hidden.",
    icon: DollarSign,
  },
  {
    key: FLAGS.BLOG_FEATURE,
    title: "Blog Feature",
    description: "Control whether the blog feature is available to users. When disabled, blog-related functionality will be hidden.",
    icon: FileText,
  },
  {
    key: FLAGS.NEWS_FEATURE,
    title: "News Feature",
    description: "Control whether the news feature is available to users. When disabled, news-related functionality will be hidden.",
    icon: Newspaper,
  },
  {
    key: FLAGS.VIDEO_SEGMENT_CONTENT_TABS,
    title: "Video Segment Content Tabs",
    description: "Control whether the video segment content tabs feature is available.",
    icon: FileText,
  },
];
