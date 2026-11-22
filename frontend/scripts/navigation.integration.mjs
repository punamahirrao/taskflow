import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

// Creates a fresh account. Use a disposable development database.
const api = process.env.TASKFLOW_TEST_API_URL ?? "http://localhost:8000";
const app = process.env.TASKFLOW_TEST_APP_URL ?? "http://localhost:5174";
const output = process.env.TASKFLOW_TEST_OUTPUT_DIR ?? join(tmpdir(), "taskflow-navigation-check");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1536, height: 1050 } });
const email = `menu-check-${Date.now()}@example.test`;
const password = "Taskflow-Menu-2026!";
const registration = await context.request.post(`${api}/accounts/register/`, {
  data: {
    email,
    job_title: "Founder",
    organization_name: "Northwind Studio",
    password,
    confirm_password: password,
  },
});
assert.equal(registration.status(), 201);
const auth = await (
  await context.request.post(`${api}/accounts/login/`, { data: { email, password } })
).json();
await context.addInitScript(({ tokens, user }) => {
  if (!sessionStorage.getItem("access_token")) {
    sessionStorage.setItem("access_token", tokens.access);
    sessionStorage.setItem("refresh_token", tokens.refresh);
    sessionStorage.setItem("user", JSON.stringify(user));
  }
  localStorage.setItem("taskflow:sidebar-collapsed", "false");
}, auth);
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const configurePath = "/settings/administration/configure-taskflow";
async function openEditor() {
  await page.goto(`${app}${configurePath}`);
  await page.getByTestId("configure-taskflow").waitFor();
}
try {
  await page.goto(`${app}/settings`);
  await page.getByTestId("page-settings").waitFor();
  const rail = page.locator(".settings-rail");
  assert.equal(
    await rail.getByRole("link", { name: "Billing & Subscription", exact: true }).count(),
    0,
  );
  assert.equal(await rail.getByRole("link", { name: "Audit Logs", exact: true }).count(), 0);
  await rail.getByRole("link", { name: "Administration", exact: true }).click();
  await page.getByRole("region", { name: "Administration options" }).waitFor();
  assert.equal(await page.locator(".settings-main .settings-category-card").count(), 5);
  await page.getByRole("link", { name: /^Billing & Subscription Your organization/ }).click();
  await page.getByRole("link", { name: "Plan Details", exact: true }).click();
  await page.getByRole("heading", { name: "Plan Details", exact: true }).waitFor();
  assert.match(
    new URL(page.url()).pathname,
    /administration\/billing-and-subscription\/plan-details$/,
  );
  await page.goto(`${app}/settings/billing/invoices`);
  await page.waitForURL("**/settings/administration/billing-and-subscription/invoices");
  await page.getByRole("heading", { name: "Invoices", exact: true }).waitFor();
  await page.goto(`${app}/settings/audit-logs/activity-log`);
  await page.waitForURL("**/settings/administration/audit-logs/activity-log");
  await page.getByRole("heading", { name: "Activity Log", exact: true }).waitFor();
  await page.goto(`${app}/settings/administration`);
  await page.getByRole("link", { name: /^Configure Taskflow Choose/ }).click();
  await page.getByTestId("configure-taskflow").waitFor();
  assert.equal(await page.locator('tr[data-testid^="configure-row-"]').count(), 19);
  assert.equal(await page.getByTestId("nav-templates").count(), 0);
  assert.equal(
    await page.getByRole("button", { name: "Save changes", exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByLabel("Display name for Settings", { exact: true }).inputValue(),
    "Settings",
  );
  assert.equal(await page.getByTestId("nav-settings").getAttribute("data-icon"), "settings");
  console.log(
    "PASS: Billing and Audit Logs live under Administration; old links redirect; all 19 sidebar items can be configured.",
  );

  await page.getByLabel("Display name for Settings", { exact: true }).fill("Preferences");
  await page.getByRole("button", { name: "Change icon for Settings", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search icons for Settings" }).fill("star");
  await page.getByRole("radio", { name: "Star", exact: true }).check();
  await page.getByLabel("Display name for Dashboard", { exact: true }).fill("Company Home");
  await page.getByLabel("Display name for Planning", { exact: true }).fill("Delivery");
  await page.getByLabel("Display name for RoadMap", { exact: true }).fill("Delivery Map");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByText("Menu updated. Your changes are saved.", { exact: true }).waitFor();
  assert.equal(await page.getByTestId("nav-settings").getAttribute("aria-label"), "Preferences");
  assert.equal(await page.getByTestId("nav-settings").getAttribute("data-icon"), "star");
  assert.equal(await page.getByTestId("nav-settings").getAttribute("href"), "/settings");
  await page.getByTestId("nav-planning").click();
  assert.equal(
    await page.getByTestId("nav-planning-roadmap").getAttribute("aria-label"),
    "Delivery Map",
  );
  await page.getByTestId("nav-planning-roadmap").click();
  await page.waitForURL("**/planning/roadmap");
  await openEditor();
  assert.equal(
    await page.getByLabel("Display name for Settings", { exact: true }).inputValue(),
    "Preferences",
  );
  await page.reload();
  await page.getByTestId("configure-taskflow").waitFor();
  assert.equal(await page.getByTestId("nav-dashboard").getAttribute("aria-label"), "Company Home");
  console.log(
    "PASS: custom labels and selected icon update the menu, persist across navigation/reload, and preserve destinations and Planning behavior.",
  );

  await page.getByLabel("Display name for Settings", { exact: true }).fill("   ");
  assert.equal(
    await page.getByRole("button", { name: "Save changes", exact: true }).isDisabled(),
    true,
  );
  await page.getByLabel("Display name for Settings", { exact: true }).fill("Preferences");
  await page.getByRole("button", { name: "Change icon for Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset Settings to default", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByText("Menu updated. Your changes are saved.", { exact: true }).waitFor();
  assert.equal(await page.getByTestId("nav-settings").getAttribute("data-icon"), "settings");
  assert.equal(await page.getByTestId("nav-settings").getAttribute("aria-label"), "Settings");
  await page.getByLabel("Display name for Settings", { exact: true }).fill("Options");
  await page.route("**/accounts/me/navigation/", async (route) => {
    if (route.request().method() === "PUT")
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Temporary save failure" }),
      });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Temporary save failure" }).waitFor();
  assert.equal(await page.getByTestId("nav-settings").getAttribute("aria-label"), "Settings");
  assert.equal(
    await page.getByLabel("Display name for Settings", { exact: true }).inputValue(),
    "Options",
  );
  await page.unroute("**/accounts/me/navigation/");
  await page.getByRole("button", { name: "Reset all", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByText("Menu updated. Your changes are saved.", { exact: true }).waitFor();
  assert.equal(await page.getByTestId("nav-dashboard").getAttribute("aria-label"), "Dashboard");
  assert.equal(await page.getByTestId("nav-planning").getAttribute("aria-label"), "Planning");
  console.log(
    "PASS: empty names are blocked; row/all resets restore defaults; failed saves preserve the draft and do not change the menu.",
  );

  await page.getByLabel("Display name for Settings", { exact: true }).fill("Northwind Settings");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByText("Menu updated. Your changes are saved.", { exact: true }).waitFor();
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("link", { name: "Organization settings", exact: true }).click();
  await page.getByRole("button", { name: "Create new organization", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Organization name").fill("Contoso Labs");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create organization", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Switch to Contoso Labs", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await openEditor();
  assert.equal(
    await page.getByLabel("Display name for Settings", { exact: true }).inputValue(),
    "Settings",
  );
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("button", { name: "Northwind Studio", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await openEditor();
  assert.equal(
    await page.getByLabel("Display name for Settings", { exact: true }).inputValue(),
    "Northwind Settings",
  );
  await page.getByRole("searchbox", { name: "Search menu items" }).fill("Settings");
  await page.getByRole("button", { name: "Change icon for Settings", exact: true }).click();
  await page.screenshot({ path: join(output, "configure-taskflow.png"), fullPage: true });
  await page.evaluate(() => localStorage.setItem("taskflow_theme", "night"));
  await page.reload();
  await page.getByTestId("configure-taskflow").waitFor();
  await page.getByRole("searchbox", { name: "Search menu items" }).fill("Settings");
  await page.getByRole("button", { name: "Change icon for Settings", exact: true }).click();
  await page.screenshot({ path: join(output, "configure-taskflow-dark.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await page.waitForFunction(() =>
    getComputedStyle(document.querySelector(".app-shell")).gridTemplateColumns.startsWith("76px"),
  );
  await page.screenshot({ path: join(output, "configure-taskflow-mobile.png"), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(
    `PASS: preferences stay separate when switching organizations; light/dark/mobile layouts render without browser errors. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
