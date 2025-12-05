import { FileText, Clock } from "lucide-react";
import { type Segment } from "~/db/schema";
import { MarkdownContent } from "~/routes/learn/-components/markdown-content";

interface ContentPanelProps {
  currentSegment: Segment;
  isAdmin?: boolean;
}

export function ContentPanel({ currentSegment, isAdmin }: ContentPanelProps) {
  if (currentSegment.isComingSoon && !isAdmin) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>This lesson content is coming soon.</p>
      </div>
    );
  }

  if (currentSegment.content) {
    return (
      <div className="animate-fade-in">
        <MarkdownContent content={currentSegment.content} />
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No lesson content available for this segment.</p>
    </div>
  );
}
