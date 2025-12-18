import { Badge } from "~/components/ui/badge";
import { Lock, CheckCircle, Edit } from "lucide-react";
import { type Segment, type Progress } from "~/db/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { markAsCompletedFn } from "~/fn/progress";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { DeleteSegmentButton } from "./delete-segment-button";

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
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-[#0b101a]/40 backdrop-blur-md z-20 shrink-0">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {currentSegment.title}
          </h2>
          {isAdmin && currentSegment.isPremium && (
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              PREMIUM
            </Badge>
          )}
        </div>
        {currentSegment.length && (
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold font-mono">
            {currentSegment.length}
          </p>
        )}
      </div>

      <div className="flex items-center gap-5">
        {canMarkComplete && (
          <button
            onClick={handleMarkComplete}
            disabled={markCompleteMutation.isPending}
            className="cursor-pointer flex items-center gap-2 glass px-5 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10 transition"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark as Complete
          </button>
        )}

        {isAdmin && (
          <>
            <Link
              to="/learn/$slug/edit"
              params={{ slug: currentSegment.slug }}
              className="btn-cyan px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Edit className="w-4 h-4 stroke-[3.5px]" />
              Edit
            </Link>
            <DeleteSegmentButton currentSegmentId={currentSegmentId} />
          </>
        )}
      </div>
    </header>
  );
}
