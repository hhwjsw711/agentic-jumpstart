import { useState } from "react";
import { Play } from "lucide-react";
import { VideoPlayer } from "~/routes/learn/-components/video-player";

interface LazyVideoPlayerProps {
  segmentId: number;
  videoKey: string;
  thumbnailUrl?: string | null;
}

export function LazyVideoPlayer({
  segmentId,
  videoKey,
  thumbnailUrl,
}: LazyVideoPlayerProps) {
  const [isActivated, setIsActivated] = useState(false);

  // Once activated, render the actual video player
  if (isActivated) {
    return (
      <VideoPlayer
        segmentId={segmentId}
        videoKey={videoKey}
        initialThumbnailUrl={thumbnailUrl ?? null}
        autoPlay
      />
    );
  }

  // Show thumbnail with play button overlay
  return (
    <div className="w-full h-full relative">
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900" />
      )}

      {/* Play button overlay */}
      <button
        onClick={() => setIsActivated(true)}
        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group/play cursor-pointer"
        aria-label="Play video"
      >
        <div className="relative">
          <div className="p-6 rounded-full bg-white/90 dark:bg-white/80 backdrop-blur-sm group-hover/play:scale-110 transition-transform shadow-lg">
            <Play
              className="h-12 w-12 text-slate-900 ml-1"
              fill="currentColor"
            />
          </div>
        </div>
      </button>
    </div>
  );
}
