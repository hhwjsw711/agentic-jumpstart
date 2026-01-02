import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { updateSegmentContentFn } from "~/fn/segments";
import { toast } from "sonner";

type UpdateSegmentContentInput = {
  segmentId: number;
  field: "summary" | "content" | "transcripts";
  value: string;
};

export function useUpdateSegmentContent() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateSegmentContentInput) =>
      updateSegmentContentFn({ data }),
    onSuccess: async () => {
      await router.invalidate();
      toast.success("Content updated");
    },
    onError: (error) => {
      toast.error("Failed to update", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}
