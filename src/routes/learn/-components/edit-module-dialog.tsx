import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { adminMiddleware } from "~/lib/auth";
import { updateModuleUseCase } from "~/use-cases/modules";
import { useToast } from "~/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const editModuleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
});

type EditModuleFormData = z.infer<typeof editModuleSchema>;

export const updateModuleFn = createServerFn()
  .middleware([adminMiddleware])
  .validator(
    z.object({
      moduleId: z.coerce.number(),
      title: z.string().min(1).max(255),
    })
  )
  .handler(async ({ data }) => {
    await updateModuleUseCase(data.moduleId, { title: data.title });
  });

interface EditModuleDialogProps {
  moduleId: number;
  moduleTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModuleDialog({
  moduleId,
  moduleTitle,
  open,
  onOpenChange,
}: EditModuleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditModuleFormData>({
    resolver: zodResolver(editModuleSchema),
    defaultValues: {
      title: moduleTitle,
    },
  });

  const onSubmit = async (data: EditModuleFormData) => {
    try {
      setIsSubmitting(true);
      await updateModuleFn({ data: { moduleId, title: data.title } });

      toast({
        title: "Module updated successfully!",
        description: `Module title has been updated to "${data.title}".`,
      });

      await queryClient.invalidateQueries({ queryKey: ["modules"] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to update module",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-theme-500/10">
              <Edit2 className="h-5 w-5 text-theme-600 dark:text-theme-400" />
            </div>
            <DialogTitle>Edit Module</DialogTitle>
          </div>
          <DialogDescription>
            Update the title for this module. This will be displayed in the
            course outline.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter module title"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}