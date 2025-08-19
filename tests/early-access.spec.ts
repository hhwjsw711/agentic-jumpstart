import { test, expect } from "@playwright/test";
import { clearSession, createAndLoginAsNewRegularUser } from "./helpers/auth";
import { setEarlyAccessMode } from "./helpers/early-access";
import { TEST_CONFIG } from "./setup/config";

test.describe.configure({ mode: "serial" });

test.describe("Early Access Mode", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await setEarlyAccessMode(false);
  });

  test("When in early access mode, regular users should be redirected to home", async ({
    page,
  }) => {
    await setEarlyAccessMode(true);
    await createAndLoginAsNewRegularUser(page);
    await page.goto("/learn");
    await expect(page).toHaveURL("/");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.toLowerCase()).toContain(
      TEST_CONFIG.UI_TEXT.EARLY_ACCESS_INDICATOR
    );
  });

  test("When out of early access mode, regular users should be able to view the course", async ({
    page,
  }) => {
    await setEarlyAccessMode(false);
    await createAndLoginAsNewRegularUser(page);
    await page.goto("/learn");
    await expect(page).toHaveURL("/learn");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.toLowerCase()).toContain(
      TEST_CONFIG.UI_TEXT.WELCOME_TO_COURSE_INDICATOR
    );

    await page.click(
      `a:has-text("${TEST_CONFIG.UI_TEXT.START_LEARNING_LINK}")`
    );
    await expect(page).toHaveURL(
      `/learn/${TEST_CONFIG.SEGMENTS.WELCOME_TO_COURSE.slug}`
    );
  });
});
