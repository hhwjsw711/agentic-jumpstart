import { useState, useEffect } from "react";
import { FileText, MessageSquare, BookOpen, Lock, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import { type Segment } from "~/db/schema";
import { ContentPanel } from "./content-panel";
import { CommentsPanel } from "./comments-panel";
import { EditableContent } from "./editable-content";
import { GlassPanel } from "~/components/ui/glass-panel";
import { buttonVariants } from "~/components/ui/button";

type TabType = "summary" | "content" | "transcripts" | "comments";

interface VideoContentTabsPanelProps {
  currentSegment: Segment;
  isLoggedIn: boolean;
  defaultTab?: TabType;
  commentId?: number;
  isAdmin?: boolean;
  showContentTabs: boolean;
  isPremiumUser?: boolean;
}

/**
 * Placeholder shown when premium content is restricted.
 * Displays an upgrade prompt for users without premium access.
 */
function ContentUpgradePlaceholder({ contentType }: { contentType: string }) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="flex items-center justify-center">
        <div className="p-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50">
          <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Premium Content
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          The {contentType} for this lesson is available to premium members.
          Upgrade to access all course materials including transcripts, summaries, and lesson content.
        </p>
      </div>
      <Link
        to="/purchase"
        className={cn(buttonVariants({ variant: "default" }), "w-fit")}
      >
        Upgrade to Premium
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}

export function VideoContentTabsPanel({
  currentSegment,
  isLoggedIn,
  defaultTab,
  commentId,
  isAdmin,
  showContentTabs,
  isPremiumUser,
}: VideoContentTabsPanelProps) {
  // Determine if this is a premium segment that the user doesn't have access to
  const isRestrictedPremiumContent = currentSegment.isPremium && !isPremiumUser && !isAdmin;
  // Default to summary tab, fall back to comments if content tabs are disabled and trying to access content
  const effectiveDefaultTab =
    !showContentTabs && defaultTab === "content"
      ? "summary"
      : defaultTab || "summary";

  const [activeTab, setActiveTab] = useState<TabType>(effectiveDefaultTab);

  // Set active tab when defaultTab changes (from URL params)
  useEffect(() => {
    if (defaultTab) {
      // If content tabs are disabled and trying to set content, use summary instead
      if (!showContentTabs && defaultTab === "content") {
        setActiveTab("summary");
      } else {
        setActiveTab(defaultTab);
      }
    }
  }, [defaultTab, showContentTabs]);

  return (
    <GlassPanel variant="cyan">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200/60 dark:border-white/10">
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer",
            activeTab === "summary"
              ? "border-cyan-600 dark:border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Summary
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer",
            activeTab === "comments"
              ? "border-cyan-600 dark:border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Discussion
        </button>
        {showContentTabs && (
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer",
              activeTab === "content"
                ? "border-cyan-600 dark:border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <FileText className="h-4 w-4" />
            Lesson Content
          </button>
        )}
        <button
          onClick={() => setActiveTab("transcripts")}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer",
            activeTab === "transcripts"
              ? "border-cyan-600 dark:border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          )}
        >
          <FileText className="h-4 w-4" />
          Transcripts
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 min-h-96">
        {activeTab === "summary" && (
          // Show upgrade placeholder if user doesn't have premium access to this premium segment
          isRestrictedPremiumContent ? (
            <ContentUpgradePlaceholder contentType="summary" />
          ) : (
            <EditableContent
              segmentId={currentSegment.id}
              field="summary"
              content={currentSegment.summary}
              isAdmin={isAdmin ?? false}
              emptyMessage="No summary available for this segment."
              emptyIcon={
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              }
            />
          )
        )}

        {showContentTabs && activeTab === "content" && (
          // Show upgrade placeholder if user doesn't have premium access to this premium segment
          isRestrictedPremiumContent ? (
            <ContentUpgradePlaceholder contentType="lesson content" />
          ) : (
            <ContentPanel currentSegment={currentSegment} isAdmin={isAdmin} />
          )
        )}

        {activeTab === "transcripts" && (
          // Show upgrade placeholder if user doesn't have premium access to this premium segment
          isRestrictedPremiumContent ? (
            <ContentUpgradePlaceholder contentType="transcript" />
          ) : (
            <EditableContent
              segmentId={currentSegment.id}
              field="transcripts"
              content={currentSegment.transcripts}
              isAdmin={isAdmin ?? false}
              emptyMessage="No transcripts available for this segment."
              emptyIcon={
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              }
            />
          )
        )}

        {activeTab === "comments" && (
          // Show upgrade placeholder if user doesn't have premium access to this premium segment
          isRestrictedPremiumContent ? (
            <ContentUpgradePlaceholder contentType="discussion" />
          ) : (
            <CommentsPanel
              currentSegmentId={currentSegment.id}
              isLoggedIn={isLoggedIn}
              activeTab={activeTab}
              commentId={commentId}
            />
          )
        )}
      </div>
    </GlassPanel>
  );
}
