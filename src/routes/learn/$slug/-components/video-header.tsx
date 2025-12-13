import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { BookOpen, Clock, Lock, CheckCircle } from "lucide-react";
import { type Segment, type Progress } from "~/db/schema";
import { AdminControls } from "./admin-controls";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { markAsCompletedFn } from "~/fn/progress";
import { toast } from "sonner";

interface VideoHeaderProps {
  currentSegment: Segment;
  isAdmin: boolean;
  currentSegmentId: number;
  isLoggedIn: boolean;
  progress: Progress[];
  isPremium: boolean;
}

export function VideoHeader({
  currentSegment,
  isAdmin,
  currentSegmentId,
  isLoggedIn,
  progress,
  isPremium,
}: VideoHeaderProps) {
  const router = useRouter();

  const isCompleted = progress.some((p) => p.segmentId === currentSegmentId);
  const canMarkComplete =
    isLoggedIn &&
    !isCompleted &&
    !currentSegment.isComingSoon &&
    (!currentSegment.isPremium || isPremium || isAdmin);

  const markCompleteMutation = useMutation({
    mutationFn: (segmentId: number) =>
      markAsCompletedFn({ data: { segmentId } }),
    onSuccess: () => {
      router.invalidate();
      toast.success("Video marked as complete");
    },
    onError: () => {
      toast.error("Failed to mark video as complete");
    },
  });

  const handleMarkComplete = () => {
    markCompleteMutation.mutate(currentSegmentId);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-theme-100 to-theme-200 dark:from-theme-900 dark:to-theme-800">
            <BookOpen className="h-6 w-6 text-theme-600 dark:text-theme-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {currentSegment.title}
            </h1>
            {currentSegment.length && (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {currentSegment.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canMarkComplete && (
            <Button
              onClick={handleMarkComplete}
              disabled={markCompleteMutation.isPending}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Complete
            </Button>
          )}

          {isAdmin && currentSegment.isPremium && (
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              PREMIUM
            </Badge>
          )}

          {isAdmin && <AdminControls currentSegment={currentSegment} />}
        </div>
      </div>
    </div>
  );
}
