/**
 * Unit tests for isFeatureEnabledForUser - the core targeting logic
 * Tests: src/data-access/app-settings.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FLAGS, TARGET_MODES } from "~/config";

// Use vi.hoisted to ensure mocks are available when vi.mock is hoisted
const {
  mockGetUser,
  mockGetFeatureFlagTarget,
  mockGetFeatureFlagUser,
  mockLimit,
  mockDatabase,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockGetFeatureFlagTarget = vi.fn();
  const mockGetFeatureFlagUser = vi.fn();
  const mockLimit = vi.fn();

  // Mock database for getAppSetting internal call
  const mockDatabase = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: mockLimit,
        })),
      })),
    })),
  };

  return {
    mockGetUser,
    mockGetFeatureFlagTarget,
    mockGetFeatureFlagUser,
    mockLimit,
    mockDatabase,
  };
});

// Mock database
vi.mock("~/db", () => ({
  database: mockDatabase,
}));

// Mock external dependencies
vi.mock("~/data-access/users", () => ({
  getUser: mockGetUser,
}));

vi.mock("~/data-access/feature-flags", () => ({
  getFeatureFlagTarget: mockGetFeatureFlagTarget,
  getFeatureFlagUser: mockGetFeatureFlagUser,
}));

// Import the function under test AFTER mocking
import { isFeatureEnabledForUser } from "~/data-access/app-settings";

describe("isFeatureEnabledForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Helper to mock getAppSetting result via database mock
  const mockAppSetting = (value: string | null) => {
    if (value === null) {
      mockLimit.mockResolvedValueOnce([]);
    } else {
      mockLimit.mockResolvedValueOnce([{ key: "test", value, updatedAt: new Date() }]);
    }
  };

  describe("anonymous users (userId = null)", () => {
    it("should return true when flag is enabled and no targeting", async () => {
      mockAppSetting("true");

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, null);

      expect(result).toBe(true);
      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockGetFeatureFlagTarget).not.toHaveBeenCalled();
    });

    it("should return false when flag is disabled", async () => {
      mockAppSetting("false");

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, null);

      expect(result).toBe(false);
    });

    it("should return false when flag setting does not exist", async () => {
      mockAppSetting(null);

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, null);

      expect(result).toBe(false);
    });
  });

  describe("admin bypass", () => {
    it("should return true for admin user regardless of flag state", async () => {
      mockAppSetting("false");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "admin@test.com",
        isAdmin: true,
        isPremium: false,
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });

    it("should return true for admin even with restrictive targeting", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "admin@test.com",
        isAdmin: true,
        isPremium: false,
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
      expect(mockGetFeatureFlagTarget).not.toHaveBeenCalled();
    });
  });

  describe("global kill switch (baseEnabled=false)", () => {
    it("should return false for premium user when flag is disabled globally", async () => {
      mockAppSetting("false");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: true,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });

    it("should return false for user in custom list when flag is disabled globally", async () => {
      mockAppSetting("false");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.CUSTOM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
      expect(mockGetFeatureFlagUser).not.toHaveBeenCalled();
    });
  });

  describe("targetMode = ALL", () => {
    it("should return baseEnabled when targetMode is ALL", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.ALL,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });

    it("should return baseEnabled when no targeting record exists", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce(null);

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });
  });

  describe("targetMode = PREMIUM", () => {
    it("should return true for premium user when targeting is PREMIUM", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: true,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });

    it("should return false for non-premium user when targeting is PREMIUM", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });

    it("should return false when user record not found and targeting is PREMIUM", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce(undefined);
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });
  });

  describe("targetMode = NON_PREMIUM", () => {
    it("should return true for non-premium user when targeting is NON_PREMIUM", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.NON_PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });

    it("should return false for premium user when targeting is NON_PREMIUM", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: true,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.NON_PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });
  });

  describe("targetMode = CUSTOM", () => {
    it("should return true when user is in custom list with enabled=true", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.CUSTOM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      mockGetFeatureFlagUser.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        userId: 1,
        enabled: true,
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });

    it("should return false when user is in custom list with enabled=false", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.CUSTOM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      mockGetFeatureFlagUser.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        userId: 1,
        enabled: false,
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });

    it("should return false when user is NOT in custom list", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.CUSTOM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      mockGetFeatureFlagUser.mockResolvedValueOnce(null);

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should return false and log error when database throws", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockLimit.mockRejectedValueOnce(new Error("DB error"));

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return false when getUser throws", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockAppSetting("true");
      mockGetUser.mockRejectedValueOnce(new Error("DB error"));

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    it("should return false when getFeatureFlagTarget throws", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockRejectedValueOnce(new Error("DB error"));

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    it("should return false when getFeatureFlagUser throws in CUSTOM mode", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.CUSTOM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      mockGetFeatureFlagUser.mockRejectedValueOnce(new Error("DB error"));

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle user with isPremium=null (default to false)", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: null,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });

    it("should handle unknown targetMode (fallback to baseEnabled)", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: false,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: "UNKNOWN_MODE" as typeof TARGET_MODES.ALL,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });

    it("should handle user with isAdmin=null (default to false)", async () => {
      mockAppSetting("false");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: null,
        isPremium: true,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(false);
    });

    it("should work with different flag keys", async () => {
      mockAppSetting("true");

      const result = await isFeatureEnabledForUser(FLAGS.EARLY_ACCESS_MODE, null);

      expect(result).toBe(true);
    });

    it("should handle user with isPremium=null for NON_PREMIUM targeting (treats as non-premium)", async () => {
      mockAppSetting("true");
      mockGetUser.mockResolvedValueOnce({
        id: 1,
        email: "user@test.com",
        isAdmin: false,
        isPremium: null,
      });
      mockGetFeatureFlagTarget.mockResolvedValueOnce({
        id: 1,
        flagKey: FLAGS.AGENTS_FEATURE,
        targetMode: TARGET_MODES.NON_PREMIUM,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      const result = await isFeatureEnabledForUser(FLAGS.AGENTS_FEATURE, 1);

      expect(result).toBe(true);
    });
  });
});
