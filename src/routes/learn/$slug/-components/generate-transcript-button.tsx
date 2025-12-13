import { Button } from "~/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { type Segment } from "~/db/schema";
import { toast } from "sonner";
import { generateTranscriptFn } from "~/fn/transcripts";
import { useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { buttonVariants } from "~/components/ui/button";

interface GenerateTranscriptButtonProps {
  currentSegment: Segment;
}

export function GenerateTranscriptButton({
  currentSegment,
}: GenerateTranscriptButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const hasExistingTranscript = !!currentSegment.transcripts;
  const hasVideo = !!currentSegment.videoKey;

  const handleGenerateTranscript = async () => {
    if (!hasVideo) {
      toast.error("No video attached", {
        description: "This segment needs a video before generating a transcript.",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setOpen(false);

      toast.info("Generating transcript...", {
        description: "This may take a few minutes depending on the video length.",
        duration: 10000,
      });

      await generateTranscriptFn({ data: { segmentId: currentSegment.id } });

      toast.success("Transcript generated!", {
        description: "The video transcript has been created and saved.",
      });

      // Refresh the page to show the new transcript
      router.invalidate();
    } catch (error) {
      console.error("Failed to generate transcript:", error);
      toast.error("Failed to generate transcript", {
        description:
          error instanceof Error
            ? error.message
            : "Please check that ffmpeg is installed and try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasVideo) {
    return null;
  }

  // If there's an existing transcript, show a confirmation dialog
  if (hasExistingTranscript) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Regenerate Transcript
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          animation="slide-in-top-right"
          className="bg-background border border-border shadow-elevation-3 rounded-xl max-w-md mx-auto"
        >
          <AlertDialogHeader className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-foreground leading-tight">
                Regenerate Transcript?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
              This segment already has a transcript. Regenerating will replace
              the existing transcript with a new one generated from the video.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 p-6 pt-0">
            <AlertDialogCancel
              className={buttonVariants({ variant: "gray-outline" })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerateTranscript}
              className={buttonVariants({ variant: "default" })}
            >
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // No existing transcript, just show the button
  return (
    <Button variant="outline" onClick={handleGenerateTranscript} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Generate Transcript
        </>
      )}
    </Button>
  );
}
