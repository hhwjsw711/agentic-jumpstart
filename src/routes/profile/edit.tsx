import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Page } from "~/routes/admin/-components/page";
import { PageHeader } from "~/routes/admin/-components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { 
  getUserProfileFn, 
  updateProfileFn, 
  getProfileImageUploadUrlFn,
  getUserProjectsFn,
  createProjectFn,
  updateProjectFn,
  deleteProjectFn 
} from "~/fn/profiles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Upload, X, Plus, ExternalLink, Github, Save, Trash2 } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { authenticatedMiddleware } from "~/lib/auth";

const profileFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  bio: z.string().max(500).optional(),
  twitterHandle: z.string().max(50).optional(),
  githubHandle: z.string().max(50).optional(),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  projectUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  repositoryUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  technologies: z.string().optional(),
  isVisible: z.boolean().optional(),
});

export const Route = createFileRoute("/profile/edit")({
  beforeLoad: () => authenticatedMiddleware(),
  component: EditProfilePage,
});

function EditProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  const { data: profile } = useSuspenseQuery({
    queryKey: ["profile", "user"],
    queryFn: () => getUserProfileFn(),
  });

  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects", "user"],
    queryFn: () => getUserProjectsFn(),
  });

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      twitterHandle: profile?.twitterHandle || "",
      githubHandle: profile?.githubHandle || "",
      websiteUrl: profile?.websiteUrl || "",
    },
  });

  const projectForm = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      projectUrl: "",
      repositoryUrl: "",
      technologies: "",
      isVisible: true,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProjectFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsAddingProject(false);
      projectForm.reset();
      toast({
        title: "Project added",
        description: "Your project has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateProjectFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { presignedUrl, imageKey, imageUrl } = await getProfileImageUploadUrlFn({
        data: {
          fileName: file.name,
          contentType: file.type,
        },
      });

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      await updateProfileMutation.mutateAsync({
        data: {
          imageId: imageKey,
          image: imageUrl,
        },
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate({ data });
  };

  const onProjectSubmit = (data: z.infer<typeof projectFormSchema>) => {
    const projectData = {
      ...data,
      technologies: data.technologies ? JSON.stringify(data.technologies.split(",").map(t => t.trim())) : undefined,
    };

    if (editingProject) {
      updateProjectMutation.mutate({
        data: { id: editingProject, ...projectData },
      });
    } else {
      createProjectMutation.mutate({ data: projectData });
    }
  };

  return (
    <Page>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Edit Profile"
          highlightedWord="Profile"
          description="Update your profile information and showcase your projects"
        />

        <div className="space-y-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Profile Image */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-theme-100 to-theme-200 dark:from-theme-800 dark:to-theme-700">
                      <img 
                        src={profile?.image || `https://api.dicebear.com/9.x/initials/svg?seed=${profile?.displayName}&backgroundColor=6366f1&textColor=ffffff`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max file size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      {...profileForm.register("displayName")}
                      placeholder="Your display name"
                    />
                    {profileForm.formState.errors.displayName && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.displayName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website</Label>
                    <Input
                      id="websiteUrl"
                      {...profileForm.register("websiteUrl")}
                      placeholder="https://yourwebsite.com"
                    />
                    {profileForm.formState.errors.websiteUrl && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.websiteUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      {...profileForm.register("twitterHandle")}
                      placeholder="username (without @)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubHandle">GitHub Handle</Label>
                    <Input
                      id="githubHandle"
                      {...profileForm.register("githubHandle")}
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...profileForm.register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  {profileForm.formState.errors.bio && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projects & Showcases</CardTitle>
                <Button 
                  onClick={() => setIsAddingProject(true)}
                  disabled={isAddingProject}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Project Form */}
              {isAddingProject && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Project Title *</Label>
                          <Input
                            id="title"
                            {...projectForm.register("title")}
                            placeholder="My Awesome Project"
                          />
                          {projectForm.formState.errors.title && (
                            <p className="text-sm text-destructive">
                              {projectForm.formState.errors.title.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="technologies">Technologies</Label>
                          <Input
                            id="technologies"
                            {...projectForm.register("technologies")}
                            placeholder="React, TypeScript, Node.js"
                          />
                          <p className="text-xs text-muted-foreground">
                            Comma-separated list of technologies
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="projectUrl">Live Demo URL</Label>
                          <Input
                            id="projectUrl"
                            {...projectForm.register("projectUrl")}
                            placeholder="https://myproject.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="repositoryUrl">Repository URL</Label>
                          <Input
                            id="repositoryUrl"
                            {...projectForm.register("repositoryUrl")}
                            placeholder="https://github.com/username/repo"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            {...projectForm.register("imageUrl")}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          {...projectForm.register("description")}
                          placeholder="Describe your project..."
                          rows={3}
                        />
                        {projectForm.formState.errors.description && (
                          <p className="text-sm text-destructive">
                            {projectForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={createProjectMutation.isPending}
                        >
                          {createProjectMutation.isPending ? "Adding..." : "Add Project"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsAddingProject(false);
                            projectForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Projects List */}
              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">
                              {project.description}
                            </p>
                            {project.technologies && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {JSON.parse(project.technologies).map((tech: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              {project.projectUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                              {project.repositoryUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-3 w-3 mr-1" />
                                    Code
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProject(project.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProjectMutation.mutate({ data: { id: project.id } })}
                              disabled={deleteProjectMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No projects added yet. Add your first project above!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}