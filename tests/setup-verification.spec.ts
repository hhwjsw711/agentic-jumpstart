import { test, expect } from "@playwright/test";
import { testDatabase } from "./helpers/database";
import { users, modules, segments } from "~/db/schema";

test.describe("Database Setup Verification", () => {
  test("should have test data seeded correctly", async () => {
    // Verify users were created
    const allUsers = await testDatabase.select().from(users);
    expect(allUsers.length).toBeGreaterThanOrEqual(2);
    
    const adminUser = allUsers.find(u => u.email === "admin@test.com");
    const regularUser = allUsers.find(u => u.email === "user@test.com");
    
    expect(adminUser).toBeDefined();
    expect(adminUser?.isAdmin).toBe(true);
    expect(adminUser?.isPremium).toBe(true);
    
    expect(regularUser).toBeDefined();
    expect(regularUser?.isAdmin).toBe(false);
    expect(regularUser?.isPremium).toBe(false);
    
    // Verify modules were created
    const allModules = await testDatabase.select().from(modules);
    expect(allModules.length).toBeGreaterThanOrEqual(2);
    
    const gettingStartedModule = allModules.find(m => m.title === "Getting Started");
    expect(gettingStartedModule).toBeDefined();
    
    // Verify segments were created
    const allSegments = await testDatabase.select().from(segments);
    expect(allSegments.length).toBeGreaterThanOrEqual(5);
    
    const welcomeSegment = allSegments.find(s => s.slug === "welcome-to-the-course");
    const setupSegment = allSegments.find(s => s.slug === "setting-up-your-environment");
    
    expect(welcomeSegment).toBeDefined();
    expect(welcomeSegment?.title).toBe("Welcome to the Course");
    
    expect(setupSegment).toBeDefined();
    expect(setupSegment?.title).toBe("Setting Up Your Environment");
  });
});