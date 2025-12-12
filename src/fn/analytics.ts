import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getAnalyticsDashboardDataUseCase,
  getUserStatsUseCase,
  getModulesAnalyticsUseCase,
  getSegmentsAnalyticsUseCase,
  getOverallStatsUseCase,
  getEngagementInsightsUseCase,
  getCourseHealthMetricsUseCase,
} from "~/use-cases/analytics";
import {
  trackPurchaseIntent,
  generateSessionId,
  trackPageView,
} from "~/utils/analytics";
import {
  getEventTypeCounts,
  getPopularPages,
  getOverallAnalyticsStats,
  getDailyConversions,
  getUniqueUtmCampaigns,
  getDailyUtmPageViews,
  getUtmStats,
} from "~/data-access/analytics";
import { getHeaders } from "@tanstack/react-start/server";
import { adminMiddleware } from "~/lib/auth";

export const getAnalyticsDashboardDataFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getAnalyticsDashboardDataUseCase();
  });

export const getUserStatsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getUserStatsUseCase();
  });

export const getModulesAnalyticsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getModulesAnalyticsUseCase();
  });

export const getSegmentsAnalyticsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getSegmentsAnalyticsUseCase();
  });

export const getOverallStatsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getOverallStatsUseCase();
  });

export const getEngagementInsightsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getEngagementInsightsUseCase();
  });

export const getCourseHealthMetricsFn = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return getCourseHealthMetricsUseCase();
  });

// New conversion tracking functions

const trackPurchaseIntentSchema = z.object({
  sessionId: z.string(),
  buttonType: z.string().optional(),
});

export const trackPurchaseIntentFn = createServerFn()
  .validator(trackPurchaseIntentSchema)
  .handler(async ({ data }) => {
    const headers = getHeaders();
    try {
      await trackPurchaseIntent({
        headers,
        sessionId: data.sessionId,
        buttonType: data.buttonType,
      });
      return { success: true };
    } catch (error) {
      console.error("Purchase intent tracking error:", error);
      return { success: false, error: "Failed to track purchase intent" };
    }
  });

// Generate session ID for client use
export const generateSessionIdFn = createServerFn().handler(async () => {
  const headers = getHeaders();
  const userAgent = headers["User-Agent"] || undefined;
  const ipAddress =
    headers["X-Forwarded-For"] || headers["X-Real-IP"] || undefined;

  const sessionId = generateSessionId(userAgent, ipAddress);
  return { sessionId };
});

// Conversion dashboard functions
const dateRangeSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
});

// Page view tracking
const pageViewSchema = z.object({
  sessionId: z.string(),
  pagePath: z.string(),
  fullUrl: z.string().optional(),
});

export const trackPageViewFn = createServerFn()
  .validator(pageViewSchema)
  .handler(async ({ data }) => {
    const headers = getHeaders();
    try {
      await trackPageView({
        headers,
        url: data.fullUrl || `${process.env.APP_URL}${data.pagePath}`,
        sessionId: data.sessionId,
        pagePath: data.pagePath,
      });

      return { success: true };
    } catch (error) {
      console.error("Page view tracking error:", error);
      return { success: false, error: "Failed to track page view" };
    }
  });

// UTM visit tracking
const utmVisitSchema = z.object({
  sessionId: z.string(),
  pagePath: z.string(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});

export const trackUtmVisitFn = createServerFn()
  .validator(utmVisitSchema)
  .handler(async ({ data }) => {
    const headers = getHeaders();
    const userAgent = headers["User-Agent"] || undefined;
    const referrer = headers["Referer"] || undefined;
    const ipAddress =
      headers["X-Forwarded-For"] || headers["X-Real-IP"] || undefined;

    const { trackAnalyticsEvent } = await import("~/data-access/analytics");
    const { hashIpAddress } = await import("~/utils/analytics");

    try {
      await trackAnalyticsEvent({
        sessionId: data.sessionId,
        eventType: "utm_visit",
        pagePath: data.pagePath,
        referrer,
        userAgent,
        ipAddressHash: hashIpAddress(ipAddress),
        utmParams: {
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          utmTerm: data.utmTerm,
        },
        metadata: {
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          utmTerm: data.utmTerm,
        },
      });
      return { success: true };
    } catch (error) {
      console.error("UTM visit tracking error:", error);
      return { success: false, error: "Failed to track UTM visit" };
    }
  });

// Comprehensive analytics functions

const limitSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.number().optional(),
});

export const getEventTypeCountsFn = createServerFn()
  .validator(dateRangeSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getEventTypeCounts(dateRange);
  });

export const getPopularPagesFn = createServerFn()
  .validator(limitSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getPopularPages(dateRange, data.limit);
  });

export const getOverallAnalyticsStatsFn = createServerFn()
  .validator(dateRangeSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getOverallAnalyticsStats(dateRange);
  });

export const getDailyConversionsFn = createServerFn()
  .validator(dateRangeSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getDailyConversions(dateRange);
  });

// UTM Analytics functions

export const getUniqueUtmCampaignsFn = createServerFn()
  .validator(dateRangeSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getUniqueUtmCampaigns(dateRange);
  });

export const getDailyUtmPageViewsFn = createServerFn()
  .validator(dateRangeSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getDailyUtmPageViews(dateRange);
  });

export const getUtmStatsFn = createServerFn()
  .validator(dateRangeSchema)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const dateRange =
      data.start && data.end
        ? {
            start: new Date(data.start),
            end: new Date(data.end),
          }
        : undefined;

    return getUtmStats(dateRange);
  });
