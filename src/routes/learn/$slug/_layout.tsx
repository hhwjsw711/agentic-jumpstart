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
import { useEffect, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { NavigationSkeleton } from "../-components/navigation-skeleton";
import { MobileNavigationSkeleton } from "../-components/mobile-navigation-skeleton";
import { getProgressFn } from "~/fn/progress";
import { getModulesWithSegmentsFn } from "~/fn/modules";
import { VideoHeader } from "./-components/video-header";
import { QuickNavigationBar } from "./-components/quick-navigation-bar";
import { useAuth } from "~/hooks/use-auth";

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
  const user = useAuth();
  const isLoggedIn = !!user?.id;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="flex w-full h-screen overflow-hidden bg-slate-50 dark:bg-[#0b101a] text-slate-800 dark:text-slate-200">
      {/* Left Sidebar - Collapsible width */}
      <aside
        className={`hidden lg:flex h-full shrink-0 z-30 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-96"}`}
      >
        {shouldRenderNavigation ? (
          <DesktopNavigation
            modules={modulesWithSegments}
            currentSegmentId={segment.id}
            isAdmin={isAdmin}
            progress={progress}
            isPremium={isPremium}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        ) : (
          <NavigationSkeleton />
        )}
      </aside>

      {/* Main Content Area - flex-1, with header and scrollable content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
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

        {/* Video Header - Fixed height, shrink-0 */}
        <VideoHeader
          currentSegment={segment}
          isAdmin={isAdmin}
          currentSegmentId={segment.id}
          isLoggedIn={isLoggedIn}
          progress={progress}
          isPremium={isPremium}
        />

        {/* Quick Navigation Bar */}
        {shouldRenderNavigation && (
          <QuickNavigationBar
            modules={modulesWithSegments}
            currentSegmentId={segment.id}
            progress={progress}
            isPremium={isPremium}
            isAdmin={isAdmin}
          />
        )}

        {/* Scrollable content area */}
        <div className="relative z-0 flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function PrismBackground() {
  return <div className="prism-bg" />;
}

function RouteComponent() {
  const { segment } = Route.useLoaderData();

  return (
    <SidebarProvider>
      <PrismBackground />
      {segment && (
        <SegmentProvider>
          <LayoutContent />
        </SegmentProvider>
      )}
    </SidebarProvider>
  );
}
