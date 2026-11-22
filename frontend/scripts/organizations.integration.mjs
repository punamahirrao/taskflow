import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

// Run against a disposable development database; creates a fresh account per run.
const api = process.env.TASKFLOW_TEST_API_URL ?? "http://localhost:8000";
const app = process.env.TASKFLOW_TEST_APP_URL ?? "http://localhost:5174";
const output =
  process.env.TASKFLOW_TEST_OUTPUT_DIR ?? join(tmpdir(), "taskflow-organization-check");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1536, height: 1050 } });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const email = `organization-check-${Date.now()}@example.test`;
const password = "Taskflow-Company-2026!";
try {
  await page.goto(`${app}/register`);
  await page.getByTestId("register-email").fill(email);
  await page.getByTestId("register-job-title").fill("Founder");
  await page.getByTestId("register-password").fill(password);
  await page.getByTestId("register-confirm-password").fill(password);
  await page.getByTestId("register-submit").click();
  assert.equal(new URL(page.url()).pathname, "/register");
  assert.equal(
    await page
      .getByTestId("register-organization-name")
      .evaluate((input) => input.validity.valueMissing),
    true,
  );
  await page.getByTestId("register-organization-name").fill("Northwind Studio");
  await page.getByTestId("register-submit").click();
  await page.waitForURL("**/login");
  await page.getByLabel("Email Address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await page.getByTestId("organization-switcher").waitFor();
  assert.match(await page.getByTestId("organization-switcher").innerText(), /Northwind Studio/);

  async function request(path, method = "GET", data) {
    const headers = await page.evaluate(() => ({
      Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
      "X-Organization-ID": sessionStorage.getItem("active_organization_id"),
    }));
    return context.request.fetch(`${api}${path}`, { method, headers, data });
  }
  const firstProjectResponse = await request("/projects/", "POST", {
    name: "Northwind delivery",
    description: "First company only",
  });
  assert.equal(firstProjectResponse.status(), 201);
  const firstProject = await firstProjectResponse.json();
  const firstTaskResponse = await request("/tasks/", "POST", {
    project_id: firstProject.id,
    title: "Northwind confidential task",
  });
  assert.equal(firstTaskResponse.status(), 201);
  const firstTask = await firstTaskResponse.json();
  await page.reload();
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("link", { name: "Organization settings", exact: true }).click();
  await page.getByTestId("organization-settings").waitFor();
  assert.doesNotMatch(
    await page.locator(".settings-rail").innerText(),
    /\b(?:workspace|portfolio)\b/i,
  );
  assert.equal(await page.locator(".organization-settings tbody tr").count(), 1);
  assert.match(
    await page.locator(".organization-settings tbody tr").innerText(),
    /Northwind Studio\s+1/,
  );
  await page.getByRole("button", { name: "Create new organization", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  assert.equal(
    await dialog.getByRole("button", { name: "Create organization", exact: true }).isDisabled(),
    true,
  );
  await dialog.getByLabel("Organization name").fill("Contoso Labs");
  await dialog.getByRole("button", { name: "Create organization", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await page.locator(".organization-settings tbody tr").count(), 2);
  assert.equal(
    await page.getByRole("button", { name: "Create new organization", exact: true }).isDisabled(),
    true,
  );
  await page.getByRole("searchbox", { name: "Search organizations" }).fill("CONTOSO");
  assert.equal(await page.locator(".organization-settings tbody tr").count(), 1);
  await page.getByRole("searchbox", { name: "Search organizations" }).fill("no-match");
  await page.getByText("No organizations match", { exact: false }).waitFor();
  await page.getByRole("searchbox", { name: "Search organizations" }).fill("");
  await page.screenshot({ path: join(output, "organization-settings.png"), fullPage: true });
  console.log(
    "PASS: registration requires organization; settings creates, lists and filters organizations; third creation disabled.",
  );

  await page.getByTestId("organization-switcher").click();
  await page.getByRole("button", { name: "Contoso Labs", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("button", { name: "Organization: Contoso Labs", exact: true }).waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem("selected_project")), null);
  assert.deepEqual(await (await request("/projects/")).json(), []);
  assert.equal((await request(`/projects/${firstProject.id}/`)).status(), 404);
  assert.deepEqual(await (await request("/projects/directory/")).json(), []);
  const emptyTasks = await request("/tasks/");
  assert.equal(emptyTasks.status(), 200);
  assert.deepEqual(await emptyTasks.json(), []);
  const pages = [
    "dashboard",
    "my-work",
    "projects",
    "backlog",
    "sprint-train",
    "boards",
    "releases",
    "documents",
    "goals",
    "planning/roadmap",
    "planning/project-plans",
    "planning/charts",
    "planning/milestones",
    "planning/dependencies",
    "calendar",
    "reports",
    "templates",
    "ai-estimator",
    "settings",
    "profile",
    "users",
  ];
  const failedLoads = [];
  function recordFailedLoad(response) {
    if (
      response.url().startsWith(api) &&
      response.request().method() === "GET" &&
      response.status() >= 400
    ) {
      failedLoads.push(`${response.status()} ${response.url()}`);
    }
  }
  page.on("response", recordFailedLoad);
  for (const route of pages) {
    await page.goto(`${app}/${route}`);
    await page.getByTestId("organization-switcher").waitFor();
    await page.waitForLoadState("networkidle");
    assert.doesNotMatch(
      await page.locator("body").innerText(),
      /A project_id is required|Northwind confidential task/,
    );
    assert.doesNotMatch(
      await page.locator("body").innerText(),
      /\b(?:workspace|portfolio)\b/i,
      `Retired features must not appear on ${route}.`,
    );
  }
  page.off("response", recordFailedLoad);
  assert.deepEqual(
    failedLoads,
    [],
    "Empty organization pages must load without failed API requests.",
  );
  console.log(
    `PASS: ${pages.length} organization pages load in an empty organization without missing-project errors or data from the other organization.`,
  );
  await page.goto(`${app}/settings/administration`);
  await page.getByRole("region", { name: "Administration options" }).waitFor();
  assert.equal(await page.locator(".settings-main .settings-category-card").count(), 5);
  await page.getByRole("link", { name: /Users Manage user accounts/ }).waitFor();
  const secondProjectResponse = await request("/projects/", "POST", {
    name: "Contoso research",
    description: "Second company only",
  });
  assert.equal(secondProjectResponse.status(), 201);
  await page.goto(`${app}/projects`);
  await page.getByRole("heading", { name: "Contoso research", exact: true }).waitFor();
  assert.equal(await page.getByText("Northwind delivery", { exact: true }).count(), 0);
  await page.reload();
  await page.getByRole("button", { name: "Organization: Contoso Labs", exact: true }).waitFor();
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("link", { name: "Organization settings", exact: true }).click();
  await page.getByRole("button", { name: "Switch to Northwind Studio", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("button", { name: "Organization: Northwind Studio", exact: true }).waitFor();
  assert.deepEqual(
    (await (await request("/projects/")).json()).map((project) => project.id),
    [firstProject.id],
  );
  const restoredTasks = await request("/tasks/");
  assert.equal(restoredTasks.status(), 200);
  assert.deepEqual(
    (await restoredTasks.json()).map((task) => task.id),
    [firstTask.id],
  );
  await page.goto(`${app}/projects`);
  await page.getByRole("heading", { name: "Northwind delivery", exact: true }).waitFor();
  assert.equal(await page.getByText("Contoso research", { exact: true }).count(), 0);
  console.log(
    "PASS: menu and table switching reset project selection, persist on reload, and isolate project data and direct links.",
  );

  await page.goto(`${app}/settings/organizations`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("organization-switcher").click();
  const popup = await page.locator(".organization-popover").boundingBox();
  assert(popup && popup.x >= 0 && popup.x + popup.width <= 390);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    "Mobile settings must not overflow horizontally.",
  );
  await page.screenshot({ path: join(output, "organization-mobile.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1536, height: 1050 });
  await page.evaluate(() => localStorage.setItem("taskflow_theme", "night"));
  await page.reload();
  await page.getByTestId("organization-settings").waitFor();
  await page.screenshot({ path: join(output, "organization-dark.png"), fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    `PASS: mobile menu fits viewport, dark theme renders, no browser errors. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
