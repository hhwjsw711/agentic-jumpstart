import { test, expect } from "@playwright/test";
import { clearSession, createAndLoginAsNewRegularUser } from "./helpers/auth";
import { setEarlyAccessMode } from "./helpers/early-access";
import { TEST_CONFIG } from "./setup/config";

test.describe.configure({ mode: "serial" });

test.describe("Course Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await setEarlyAccessMode(false);
  });

  test("A regular should should be able to navigate through the videos", async ({
    page,
  }) => {
    await createAndLoginAsNewRegularUser(page);
    await page.goto(`/learn/${TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.slug}`);

    // verify the title of the page says "Welcome to the Course"
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.title
    );

    // verify the correct module active
    const module = page.getByLabel(
      TEST_CONFIG.LABELS.TOGGLE_MODULE_GETTING_STARTED
    );
    await expect(module).toBeVisible();

    // verify the segment is visible
    const segment = page.getByLabel(TEST_CONFIG.LABELS.SELECT_SEGMENT_WELCOME);
    await expect(segment).toBeVisible();
    const segmentItem = page
      .locator(TEST_CONFIG.CSS_CLASSES.SEGMENT_ITEM)
      .filter({ has: segment });
    await expect(segmentItem).toHaveClass(
      TEST_CONFIG.CSS_CLASSES.BORDER_THEME_200
    );

    // verify the next segment is visible
    const nextSegment = page.getByLabel(
      TEST_CONFIG.LABELS.SELECT_SEGMENT_SETUP
    );
    await expect(nextSegment).toBeVisible();
    // verify the check icon exists in the previous segment (should be completed)
    segmentItem.screenshot();
    await expect(segmentItem.locator(".lucide-circle-play")).toBeVisible();

    await nextSegment.click();
    await expect(
      page
        .locator(TEST_CONFIG.CSS_CLASSES.SEGMENT_ITEM)
        .filter({ has: nextSegment })
    ).toHaveClass(TEST_CONFIG.CSS_CLASSES.BORDER_THEME_200);

    // previous segment should not be active
    await expect(segmentItem).toHaveClass(
      TEST_CONFIG.CSS_CLASSES.BORDER_TRANSPARENT
    );

    // verify the title of the course changes to "Setting Up Your Environment"
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.SETTING_UP_ENVIRONMENT.title
    );

    // verify a user can click the back button to go back to the previous segment
    const backButton = page.getByRole("button", {
      name: TEST_CONFIG.UI_TEXT.PREVIOUS_LESSON_BUTTON,
    });
    await backButton.click();
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.title
    );

    // verify a user can click the next button to go to the next segment
    await expect(
      module.locator("span", { hasText: "0 of 3 completed" })
    ).toBeVisible();
    const nextButton = page.getByRole("button", {
      name: TEST_CONFIG.UI_TEXT.NEXT_VIDEO_BUTTON,
    });
    await nextButton.click();
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.SETTING_UP_ENVIRONMENT.title
    );

    // verify the check icon exists in the previous segment (should be completed)
    await expect(segmentItem.locator(".lucide-check")).toBeVisible();

    // Verify that the progress indicator shows 50%
    await expect(
      module.locator("span", { hasText: "1 of 3 completed" })
    ).toBeVisible();
  });

  test("A non-premium user should NOT have premium videos marked as watched when clicking Next", async ({
    page,
  }) => {
    await createAndLoginAsNewRegularUser(page);

    // Navigate to the last free segment (Your First Project - last in Getting Started module)
    await page.goto(`/learn/${TEST_CONFIG.SEGMENTS.FIRST_PROJECT.slug}`);

    // Verify we're on the correct page
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.FIRST_PROJECT.title
    );

    // Get the Advanced Topics module to check progress
    const advancedModule = page.getByLabel(
      TEST_CONFIG.LABELS.TOGGLE_MODULE_ADVANCED_TOPICS
    );

    // Expand the Advanced Topics module to see progress
    await advancedModule.click();

    // Verify the advanced patterns segment shows the lock icon (premium indicator)
    const advancedPatternsSegment = page.getByLabel(
      TEST_CONFIG.LABELS.SELECT_SEGMENT_ADVANCED_PATTERNS
    );
    await expect(advancedPatternsSegment).toBeVisible();

    // Verify initial progress is 0 of 2 for Advanced Topics module
    await expect(
      advancedModule.locator("span", { hasText: "0 of 2 completed" })
    ).toBeVisible();

    // Click the "Next Video" button - this should navigate to the next segment
    // but NOT mark the premium segment as watched for a non-premium user
    const nextButton = page.getByRole("button", {
      name: TEST_CONFIG.UI_TEXT.NEXT_VIDEO_BUTTON,
    });
    await nextButton.click();

    // Verify we navigated to the next segment (Advanced Patterns - premium)
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.ADVANCED_PATTERNS.title
    );

    // Verify the progress for Advanced Topics module is still 0 of 2
    // The premium video should NOT have been marked as watched
    await expect(
      advancedModule.locator("span", { hasText: "0 of 2 completed" })
    ).toBeVisible();

    // The segment item should NOT have a check icon
    const advancedPatternsSegmentItem = page
      .locator(TEST_CONFIG.CSS_CLASSES.SEGMENT_ITEM)
      .filter({ has: advancedPatternsSegment });
    await expect(advancedPatternsSegmentItem.locator(".lucide-check")).not.toBeVisible();
  });

  test("A user can manually mark a video as complete using the dropdown menu", async ({
    page,
  }) => {
    await createAndLoginAsNewRegularUser(page);
    await page.goto(`/learn/${TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.slug}`);

    // Verify we're on the correct page
    await expect(page.locator("h1")).toHaveText(
      TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.title
    );

    // Get the module to check progress
    const module = page.getByLabel(
      TEST_CONFIG.LABELS.TOGGLE_MODULE_GETTING_STARTED
    );
    await expect(module).toBeVisible();

    // Verify initial progress is 0 of 3
    await expect(
      module.locator("span", { hasText: "0 of 3 completed" })
    ).toBeVisible();

    // Find the segment item for "Setting Up Your Environment" (not the currently active one)
    const setupSegment = page.getByLabel(TEST_CONFIG.LABELS.SELECT_SEGMENT_SETUP);
    await expect(setupSegment).toBeVisible();

    const setupSegmentItem = page
      .locator(TEST_CONFIG.CSS_CLASSES.SEGMENT_ITEM)
      .filter({ has: setupSegment });

    // Verify the segment is not completed (should have play icon, not check icon)
    await expect(setupSegmentItem.locator(".lucide-circle-play")).toBeVisible();
    await expect(setupSegmentItem.locator(".lucide-check")).not.toBeVisible();

    // Hover over the segment item to reveal the dropdown menu trigger
    await setupSegmentItem.hover();

    // Click the dropdown menu trigger (the three dots button)
    const menuTrigger = setupSegmentItem.getByLabel("Segment options");
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();

    // Click "Mark as Complete" option
    const markCompleteOption = page.getByRole("menuitem", { name: /mark as complete/i });
    await expect(markCompleteOption).toBeVisible();
    await markCompleteOption.click();

    // Verify the success toast appears
    await expect(page.getByText("Video marked as complete")).toBeVisible();

    // Verify the segment now shows the check icon (completed)
    await expect(setupSegmentItem.locator(".lucide-check")).toBeVisible();

    // Verify progress updated to 1 of 3
    await expect(
      module.locator("span", { hasText: "1 of 3 completed" })
    ).toBeVisible();

    // Verify the dropdown menu is no longer visible for the completed segment
    await setupSegmentItem.hover();
    await expect(setupSegmentItem.getByLabel("Segment options")).not.toBeVisible();
  });
});
