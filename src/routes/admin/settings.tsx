import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { PageHeader } from "~/routes/admin/-components/page-header";
import { Settings, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleEarlyAccessModeFn,
  getEarlyAccessModeFn,
} from "~/fn/app-settings";
import { assertIsAdminFn } from "~/fn/auth";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  beforeLoad: () => assertIsAdminFn(),
  component: SettingsPage,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData({
      queryKey: ["earlyAccessMode"],
      queryFn: () => getEarlyAccessModeFn(),
    });
  },
});

function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: earlyAccessMode, isLoading } = useQuery({
    queryKey: ["earlyAccessMode"],
    queryFn: () => getEarlyAccessModeFn(),
  });

  const toggleEarlyAccessMutation = useMutation({
    mutationFn: toggleEarlyAccessModeFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["earlyAccessMode"] });
      toast.success("Early access mode updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update early access mode");
      console.error("Failed to toggle early access mode:", error);
    },
  });

  const handleToggleEarlyAccess = (checked: boolean) => {
    toggleEarlyAccessMutation.mutate({ data: { enabled: checked } });
  };

  return (
    <div className="p-8">
      <PageHeader
        title="App Settings"
        description="Manage application settings and feature flags"
        highlightedWord="Settings"
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Early Access Mode
            </CardTitle>
            <CardDescription>
              Control whether the platform is in early access mode. When
              enabled, only admins can access the full site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Switch
                id="early-access-mode"
                checked={earlyAccessMode || false}
                onCheckedChange={handleToggleEarlyAccess}
                disabled={isLoading || toggleEarlyAccessMutation.isPending}
              />
              <Label htmlFor="early-access-mode" className="cursor-pointer">
                {earlyAccessMode ? "Enabled" : "Disabled"}
              </Label>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {earlyAccessMode
                ? "Only administrators can currently access the site. Regular users will see the early access page."
                : "The site is open to all users."}
            </p>
          </CardContent>
        </Card>

        {/* Placeholder for future settings */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>More Settings Coming Soon</CardTitle>
            <CardDescription>
              Additional configuration options will be available here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Future settings may include maintenance mode, feature toggles, and
              other administrative controls.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
