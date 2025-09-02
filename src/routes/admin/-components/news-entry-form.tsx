import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createNewsEntryFn, updateNewsEntryFn } from "~/fn/news";
import { useState } from "react";

const newsEntrySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["video", "blog", "changelog"], {
    required_error: "Please select a content type",
  }),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  publishedAt: z.string().min(1, "Published date is required"),
  isPublished: z.boolean().default(true),
});

type NewsEntryFormData = z.infer<typeof newsEntrySchema>;

interface NewsEntryFormProps {
  entry?: any;
  availableTags: any[];
  onSuccess: () => void;
}

export function NewsEntryForm({ entry, availableTags, onSuccess }: NewsEntryFormProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    entry?.tags?.map((tag: any) => tag.id) || []
  );

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // 'yyyy-MM-ddTHH:mm'
  };

  const form = useForm<NewsEntryFormData>({
    resolver: zodResolver(newsEntrySchema),
    defaultValues: {
      title: entry?.title || "",
      description: entry?.description || "",
      url: entry?.url || "",
      type: entry?.type || "blog",
      imageUrl: entry?.imageUrl || "",
      publishedAt: entry?.publishedAt 
        ? formatDateForInput(entry.publishedAt)
        : formatDateForInput(new Date()),
      isPublished: entry?.isPublished ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createNewsEntryFn,
    onSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: updateNewsEntryFn,
    onSuccess,
  });

  const onSubmit = (data: NewsEntryFormData) => {
    const formData = {
      ...data,
      publishedAt: new Date(data.publishedAt),
      tagIds: selectedTagIds,
      imageUrl: data.imageUrl || undefined,
      description: data.description || undefined,
    };

    if (entry) {
      updateMutation.mutate({
        data: {
          id: entry.id,
          updates: formData,
        },
      });
    } else {
      createMutation.mutate({ data: formData });
    }
  };

  const addTag = (tagId: number) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: number) => {
    setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter news title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the content..." 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional description that will be shown in the news list
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/article" {...field} />
                </FormControl>
                <FormDescription>
                  Link to the YouTube video, blog post, or changelog
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="video">📹 YouTube Video</SelectItem>
                    <SelectItem value="blog">📝 Blog Post</SelectItem>
                    <SelectItem value="changelog">🔄 Changelog</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Thumbnail or preview image for the news entry
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publishedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Published Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                When this content was published
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-3">
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTagIds.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <Badge 
                      key={tagId}
                      variant="outline"
                      className="flex items-center gap-1"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tagId)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            
            <Select onValueChange={(value) => addTag(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags..." />
              </SelectTrigger>
              <SelectContent>
                {availableTags
                  .filter(tag => !selectedTagIds.includes(tag.id))
                  .map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Select tags to categorize this news entry (claude, cursor, cline, llms, tutorial, etc.)
          </p>
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Published</FormLabel>
                <FormDescription>
                  Make this news entry visible to the public
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading 
              ? (entry ? "Updating..." : "Creating...") 
              : (entry ? "Update Entry" : "Create Entry")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}