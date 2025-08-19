import { test, expect } from "@playwright/test";
import { createMockUserSession, clearSession } from "./helpers/auth";
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
    await createMockUserSession(page);
    await page.goto(`/learn/${TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.slug}`);

    // verify the title of the page says "Welcome to the Course"
    await expect(page.locator("h1")).toHaveText(TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.title);

    // verify the correct module active
    const module = page.getByLabel(TEST_CONFIG.LABELS.TOGGLE_MODULE_GETTING_STARTED);
    await expect(module).toBeVisible();

    // verify the segment is visible
    const segment = page.getByLabel(TEST_CONFIG.LABELS.SELECT_SEGMENT_WELCOME);
    await expect(segment).toBeVisible();
    const segmentItem = page.locator(TEST_CONFIG.CSS_CLASSES.SEGMENT_ITEM).filter({ has: segment });
    await expect(segmentItem).toHaveClass(TEST_CONFIG.CSS_CLASSES.BORDER_THEME_200);

    // verify the next segment is visible
    const nextSegment = page.getByLabel(
      TEST_CONFIG.LABELS.SELECT_SEGMENT_SETUP
    );
    await expect(nextSegment).toBeVisible();
    await nextSegment.click();
    await expect(
      page.locator(TEST_CONFIG.CSS_CLASSES.SEGMENT_ITEM).filter({ has: nextSegment })
    ).toHaveClass(TEST_CONFIG.CSS_CLASSES.BORDER_THEME_200);

    // previous segment should not be active
    await expect(segmentItem).toHaveClass(TEST_CONFIG.CSS_CLASSES.BORDER_TRANSPARENT);

    // verify the title of the course changes to "Setting Up Your Environment"
    await expect(page.locator("h1")).toHaveText(TEST_CONFIG.SEGMENTS.SETTING_UP_ENVIRONMENT.title);

    // verify a user can click the back button to go back to the previous segment
    const backButton = page.getByRole("button", { name: TEST_CONFIG.UI_TEXT.PREVIOUS_LESSON_BUTTON });
    await backButton.click();
    await expect(page.locator("h1")).toHaveText(TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.title);

    // verify a user can click the next button to go to the next segment
    const nextButton = page.getByRole("button", { name: TEST_CONFIG.UI_TEXT.NEXT_VIDEO_BUTTON });
    await nextButton.click();
    await expect(page.locator("h1")).toHaveText(TEST_CONFIG.SEGMENTS.SETTING_UP_ENVIRONMENT.title);
  });
});
