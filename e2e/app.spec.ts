import { test, expect } from "@playwright/test";

test.describe("Job Application Tracker", () => {
  test("sign-in page loads and shows auth options", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByText(/sign in/i)).toBeVisible();
    // Should show OAuth buttons or email form
    await expect(
      page.getByRole("button", { name: /github/i }).or(page.getByRole("button", { name: /google/i }).or(page.getByRole("button", { name: /sign in/i })))
    ).toBeVisible();
  });

  test("unauthenticated user is redirected to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/signin/);
  });

  test("applications page loads for authenticated user", async ({ page }) => {
    // This test assumes the user is already authenticated via setup
    await page.goto("/applications");
    await expect(page.getByRole("heading", { name: /applications/i })).toBeVisible();
  });

  test("new application form validates required fields", async ({ page }) => {
    await page.goto("/applications/new");
    // Try submitting empty form
    await page.getByRole("button", { name: /create|save|submit/i }).click();
    // Should show validation errors
    await expect(page.getByText(/required|fix/i)).toBeVisible();
  });

  test("dashboard shows stats and chart area", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    // Should have stat cards
    await expect(page.getByText(/total/i)).toBeVisible();
  });
});
