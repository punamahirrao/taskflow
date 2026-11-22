import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const web = process.env.TASKFLOW_WEB_URL ?? "http://127.0.0.1:5175";
const apiBase = process.env.TASKFLOW_API_URL ?? "http://127.0.0.1:8001";
const access = await readFile(
  new URL("../../backend/PREPROD-ACCESS.local.md", import.meta.url),
  "utf8",
);
const password = access.match(
  /## preprod accounts created[\s\S]*?Initial password: `([^`]+)`/,
)?.[1];
assert(password, "Run seed_preprod before the preprod smoke suite.");
const loginResponse = await fetch(`${apiBase}/accounts/login/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "punam@advirid.example", password, account_type: "private" }),
});
assert.equal(loginResponse.status, 200, "Punam can log in");
const session = await loginResponse.json();
const auth = {
  Authorization: `Bearer ${session.tokens.access}`,
  "Content-Type": "application/json",
};
const directory = await (
  await fetch(`${apiBase}/accounts/organizations/`, { headers: auth })
).json();
const organization = directory.organizations.find((item) => item.name === "Advirid Technologies");
assert.equal(organization.role, "owner");
await fetch(`${apiBase}/accounts/organizations/${organization.id}/switch/`, {
  method: "POST",
  headers: auth,
});
auth["X-Organization-ID"] = String(organization.id);
const originalPreferences = await (
  await fetch(`${apiBase}/accounts/me/navigation/`, { headers: auth })
).json();
const chosenColor = originalPreferences.items.dashboard?.color === "rose" ? "blue" : "rose";
const projects = await (await fetch(`${apiBase}/projects/`, { headers: auth })).json();
const boards = await (await fetch(`${apiBase}/tasks/boards/`, { headers: auth })).json();
assert.equal(projects.length, 3);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(
  ({ session, organizationId }) => {
    if (!sessionStorage.getItem("access_token")) {
      sessionStorage.setItem("access_token", session.tokens.access);
      sessionStorage.setItem("refresh_token", session.tokens.refresh);
      sessionStorage.setItem("user", JSON.stringify(session.user));
      sessionStorage.setItem("active_organization_id", String(organizationId));
    }
  },
  { session, organizationId: organization.id },
);
const page = await context.newPage();
const temporaryTasks = [];
const errors = [];
const pendingApi = new Set();
let lastApiActivity = Date.now();
page.on("request", (request) => {
  if (request.url().startsWith(apiBase)) {
    pendingApi.add(request);
    lastApiActivity = Date.now();
  }
});
const finished = (request) => {
  pendingApi.delete(request);
  lastApiActivity = Date.now();
};
page.on("requestfinished", finished);
page.on("requestfailed", finished);
async function waitForApiIdle() {
  const deadline = Date.now() + 20000;
  while (pendingApi.size || Date.now() - lastApiActivity < 350) {
    assert(
      Date.now() < deadline,
      `API did not settle on ${page.url()}: ${[...pendingApi].map((request) => new URL(request.url()).pathname).join(", ")}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.url().startsWith(apiBase) && response.status() >= 400)
    errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
});
try {
  const routes = [
    "/dashboard",
    "/projects",
    "/backlog",
    "/sprint-train",
    "/boards",
    `/boards/${boards.find((board) => !board.is_archived).id}`,
    "/documents",
    "/calendar",
    "/reports",
    "/releases",
    "/goals",
    "/templates",
    "/planning/milestones",
    "/planning/dependencies",
    "/planning/roadmap",
    "/settings/administration/audit-logs",
    "/settings/administration/billing-and-subscription",
    "/users",
    "/settings/administration/font-and-size",
    "/settings/administration/configure-taskflow",
  ];
  for (const route of routes) {
    await page.goto(web + route);
    await page.getByTestId("organization-switcher").waitFor();
    await page.getByText("PREPROD", { exact: true }).waitFor();
    await page.locator(".shell-content main").first().waitFor();
    await waitForApiIdle();
    assert(
      !(await page.getByText("This page could not be displayed", { exact: true }).count()),
      route,
    );
    assert(!/project_id is required/i.test(await page.locator("body").innerText()), route);
  }
  await page.getByRole("button", { name: "Change icon for Dashboard", exact: true }).click();
  await page
    .getByRole("radio", { name: chosenColor === "rose" ? "Rose" : "Blue", exact: true })
    .check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByText("You have unsaved changes.", { exact: true }).waitFor({ state: "hidden" });
  const preferences = await (
    await fetch(`${apiBase}/accounts/me/navigation/`, { headers: auth })
  ).json();
  assert.equal(preferences.items.dashboard.color, chosenColor);
  await mkdir(new URL("../.artifacts/", import.meta.url), { recursive: true });
  await page.screenshot({
    path: new URL("../.artifacts/preprod-configuration.png", import.meta.url).pathname.replace(
      /^\/(\w:)/,
      "$1",
    ),
    fullPage: true,
  });
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("button", { name: "Advirid Sandbox", exact: true }).click();
  await page.getByRole("button", { name: "Organization: Advirid Sandbox", exact: true }).waitFor();
  await page.locator(".shell-content main").first().waitFor();
  await waitForApiIdle();
  assert(
    !(await page.getByText("Taskflow Web Experience", { exact: true }).count()),
    "Advirid project hidden in sandbox",
  );
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("button", { name: "Advirid Technologies", exact: true }).click();
  await page
    .getByRole("button", { name: "Organization: Advirid Technologies", exact: true })
    .waitFor();
  await page.locator(".shell-content main").first().waitFor();
  await waitForApiIdle();
  const project = projects.find((item) => item.is_default) ?? projects[0];
  for (const suffix of ["source", "target"]) {
    const response = await fetch(`${apiBase}/tasks/`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        project_id: project.id,
        title: `Preprod smoke link ${suffix}`,
        status: "backlog",
        work_type: "task",
      }),
    });
    assert.equal(response.status, 201);
    temporaryTasks.push(await response.json());
  }
  await page.goto(web + "/backlog");
  await page.getByText(temporaryTasks[0].title, { exact: true }).first().click();
  const editor = page.getByRole("dialog", { name: "Edit work item" });
  await editor
    .getByRole("searchbox", { name: "Search related work items" })
    .fill(temporaryTasks[1].title);
  await editor
    .locator("fieldset")
    .filter({ has: page.getByText("Related work items", { exact: true }) })
    .getByRole("checkbox")
    .check();
  await editor.getByRole("button", { name: "Save changes", exact: true }).click();
  await editor.waitFor({ state: "hidden" });
  const linked = await (
    await fetch(`${apiBase}/tasks/?project_id=${project.id}`, { headers: auth })
  ).json();
  assert(
    linked
      .find((item) => item.id === temporaryTasks[0].id)
      .related_tasks.includes(temporaryTasks[1].id),
  );
  assert(
    linked
      .find((item) => item.id === temporaryTasks[1].id)
      .related_tasks.includes(temporaryTasks[0].id),
  );
  const loginPage = await browser.newPage();
  await loginPage.goto(web + "/login");
  await loginPage.locator('input[type="email"]').fill("punam@advirid.example");
  await loginPage.locator('input[type="password"]').fill(password);
  await loginPage.locator('button[type="submit"]').click();
  await loginPage.waitForURL("**/dashboard");
  await loginPage.getByTestId("organization-switcher").waitFor();
  await loginPage.locator(".profile-menu-trigger").click();
  await loginPage.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await loginPage.waitForURL("**/login");
  assert.equal(await loginPage.evaluate(() => sessionStorage.getItem("access_token")), null);
  await loginPage.close();
  assert.deepEqual(errors, [], "No runtime errors or API failures during page/switch smoke checks");
  console.log(
    `Passed ${routes.length} preprod pages, persisted icon color, organization switching, task-link editing, and UI sign-in/sign-out.`,
  );
} finally {
  for (const task of temporaryTasks)
    await fetch(`${apiBase}/tasks/${task.id}/`, { method: "DELETE", headers: auth });
  await fetch(`${apiBase}/accounts/organizations/${organization.id}/switch/`, {
    method: "POST",
    headers: auth,
  });
  await fetch(`${apiBase}/accounts/me/navigation/`, {
    method: "PUT",
    headers: auth,
    body: JSON.stringify(originalPreferences),
  });
  await browser.close();
}
