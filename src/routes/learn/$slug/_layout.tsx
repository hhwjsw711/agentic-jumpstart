import {
  Outlet,
  createFileRoute,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { SidebarProvider } from "~/components/ui/sidebar";
import { MobileNavigation } from "~/routes/learn/-components/mobile-navigation";
import { DesktopNavigation } from "~/routes/learn/-components/desktop-navigation";
import { getSegmentInfoFn } from "./_layout.index";
import { isAdminFn, isUserPremiumFn } from "~/fn/auth";
import {
  SegmentProvider,
  useSegment,
} from "~/routes/learn/-components/segment-context";
import { useEffect } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { NavigationSkeleton } from "../-components/navigation-skeleton";
import { MobileNavigationSkeleton } from "../-components/mobile-navigation-skeleton";
import { getProgressFn } from "~/fn/progress";
import { getModulesWithSegmentsFn } from "~/fn/modules";

export const modulesQueryOptions = queryOptions({
  queryKey: ["modules"],
  queryFn: () => getModulesWithSegmentsFn(),
});

export const Route = createFileRoute("/learn/$slug/_layout")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const [{ segment }, isPremium, isAdmin, progress] = await Promise.all([
      getSegmentInfoFn({ data: { slug: params.slug } }),
      isUserPremiumFn(),
      isAdminFn(),
      getProgressFn(),
    ]);

    if (!segment) {
      throw redirect({ to: "/learn/not-found" });
    }

    await queryClient.ensureQueryData(modulesQueryOptions);

    return { segment, isPremium, progress, isAdmin };
  },
});

function LayoutContent() {
  const { segment, isPremium, isAdmin, progress } = Route.useLoaderData();
  const navigate = useNavigate();
  const { currentSegmentId, setCurrentSegmentId } = useSegment();

  const { data: modulesWithSegments, isLoading: isModulesLoading } =
    useQuery(modulesQueryOptions);

  // Combined effect to handle both initialization and navigation
  useEffect(() => {
    if (!currentSegmentId) {
      setCurrentSegmentId(segment.id);
      return;
    }

    if (currentSegmentId !== segment.id) {
      const newSegment = modulesWithSegments
        ?.flatMap((module) => module.segments)
        .find((s) => s.id === currentSegmentId);
      if (newSegment && newSegment.slug !== segment.slug) {
        console.log("navigating to", newSegment.slug);
        navigate({ to: "/learn/$slug", params: { slug: newSegment.slug } });
      }
    }
  }, [
    currentSegmentId,
    segment.id,
    segment.slug,
    modulesWithSegments,
    navigate,
    setCurrentSegmentId,
  ]);

  // Don't render navigation until modules data is loaded to prevent layout shifts
  const shouldRenderNavigation = !isModulesLoading && modulesWithSegments;

  return (
    <div className="flex w-full">
      {/* Desktop Navigation */}
      <div className="hidden lg:block w-80 xl:w-[440px] flex-shrink-0">
        {shouldRenderNavigation ? (
          <DesktopNavigation
            modules={modulesWithSegments}
            currentSegmentId={segment.id}
            isAdmin={isAdmin}
            progress={progress}
            isPremium={isPremium}
          />
        ) : (
          <NavigationSkeleton />
        )}
      </div>

      <div className="flex-1 w-full min-w-0">
        {/* Mobile Navigation */}
        {shouldRenderNavigation ? (
          <MobileNavigation
            modules={modulesWithSegments}
            currentSegmentId={segment.id}
            progress={progress}
            isAdmin={isAdmin}
            isPremium={isPremium}
          />
        ) : (
          <MobileNavigationSkeleton />
        )}

        <main className="w-full p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { segment } = Route.useLoaderData();

  return (
    <SidebarProvider>
      {segment && (
        <SegmentProvider>
          <LayoutContent />
        </SegmentProvider>
      )}
    </SidebarProvider>
  );
}
