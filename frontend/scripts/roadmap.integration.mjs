import { chromium } from "playwright";
import assert from "node:assert/strict";

// Uses a disposable feature and stories in the seeded local development project.
const api = process.env.TASKFLOW_TEST_API_URL ?? "http://localhost:8000";
const app = process.env.TASKFLOW_TEST_APP_URL ?? "http://localhost:5174";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1536, height: 1050 } });
const createdIds = new Set();
let headers;
try {
  const login = await context.request.post(`${api}/accounts/login/`, {
    maxRetries: 3,
    data: {
      email: process.env.TASKFLOW_TEST_EMAIL ?? "agile.user01@example.test",
      password: process.env.TASKFLOW_TEST_PASSWORD ?? "TaskFlowDemo-2026!",
      account_type: "organization",
    },
  });
  assert.equal(login.status(), 200, "Demo login failed; start the backend and run seed_data.");
  const auth = await login.json();
  headers = { Authorization: `Bearer ${auth.tokens.access}` };
  const projects = await (await context.request.get(`${api}/projects/`, { headers })).json();
  const project = projects.find((item) => item.name === "Agile Sample Project 01");
  assert(project, "Run seed_data and seed_roadmap before this browser check.");
  async function create(values) {
    const response = await context.request.post(`${api}/tasks/`, {
      headers,
      data: { project_id: project.id, ...values },
    });
    assert.equal(response.status(), 201, "Test work item could not be created.");
    const task = await response.json();
    createdIds.add(task.id);
    return task;
  }
  async function savedTask(id) {
    const tasks = await (
      await context.request.get(`${api}/tasks/?project_id=${project.id}`, { headers })
    ).json();
    return tasks.find((task) => task.id === id);
  }
  const name = `Roadmap browser check ${Date.now()}`;
  const stories = [];
  for (let index = 0; index < 10; index++)
    stories.push(
      await create({
        title: `${name} story ${index}`,
        work_type: "story",
        status: index === 0 ? "done" : "backlog",
      }),
    );
  const unassigned = await create({
    title: `${name} unassigned story`,
    work_type: "story",
    status: "backlog",
  });
  const feature = await create({
    title: name,
    work_type: "epic",
    status: "backlog",
    tags: ["roadmap", "browser-check"],
    planned_start_date: "2026-11-23",
    due_date: "2026-11-27",
    roadmap_color: "#2563eb",
    story_ids: stories.map((story) => story.id),
  });
  await context.addInitScript(
    ({ tokens, user, projectId }) => {
      sessionStorage.setItem("access_token", tokens.access);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("selected_project", String(projectId));
    },
    { ...auth, projectId: project.id },
  );
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${app}/planning/roadmap`);
  const bar = page.locator(`[data-feature-id="${feature.id}"]`);
  await bar.waitFor();
  await page.getByRole("button", { name: "Week scale", exact: true }).click();
  assert.equal(await bar.getAttribute("data-progress"), "10");

  async function drag(locator, pixels, successful = true) {
    await locator.scrollIntoViewIfNeeded();
    const bounds = await locator.boundingBox();
    const response = page.waitForResponse(
      (result) =>
        result.request().method() === "PATCH" &&
        new URL(result.url()).pathname === `/tasks/${feature.id}/`,
    );
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + pixels, bounds.y + bounds.height / 2, {
      steps: 8,
    });
    await page.mouse.up();
    assert.equal((await response).ok(), successful);
    await page.waitForFunction(() => !document.querySelector(".roadmap-timeline-bar.is-dragging"));
  }
  await drag(bar.locator(".roadmap-bar-body"), 40);
  assert.equal((await savedTask(feature.id)).planned_start_date, "2026-11-25");
  assert.equal((await savedTask(feature.id)).due_date, "2026-11-29");
  await drag(page.getByRole("button", { name: `Resize end of ${name}`, exact: true }), 60);
  assert.equal((await savedTask(feature.id)).due_date, "2026-12-02");
  await drag(page.getByRole("button", { name: `Resize start of ${name}`, exact: true }), 20);
  assert.equal((await savedTask(feature.id)).planned_start_date, "2026-11-26");
  console.log("PASS: pointer move preserves duration; both resize handles save exact dates.");

  for (const scale of ["monthly", "quarterly", "yearly", "weekly"]) {
    await page
      .getByRole("button", {
        name: `${scale[0].toUpperCase() + scale.slice(1)} scale`,
        exact: true,
      })
      .click();
    await bar.waitFor();
    assert.equal(
      await page
        .getByRole("button", {
          name: `${scale[0].toUpperCase() + scale.slice(1)} scale`,
          exact: true,
        })
        .getAttribute("aria-pressed"),
      "true",
    );
  }
  await page.getByRole("button", { name: `Edit ${name}`, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Use color #db2777", exact: true }).click();
  await dialog.getByRole("button", { name: "Save feature", exact: true }).click();
  await page.waitForFunction(
    (id) =>
      document
        .querySelector(`[data-feature-id="${id}"]`)
        ?.style.getPropertyValue("--feature-color") === "#db2777",
    feature.id,
  );
  assert.equal((await savedTask(feature.id)).roadmap_color, "#db2777");

  await bar.locator(".roadmap-bar-body").click();
  await page.getByRole("button", { name: /^User stories/ }).click();
  await page
    .getByRole("combobox", { name: "User stories feature" })
    .selectOption(String(feature.id));
  for (let index = 1; index < stories.length; index++) {
    await page
      .getByRole("checkbox", { name: `Complete story: ${name} story ${index}`, exact: true })
      .check();
    await page.waitForFunction(
      ({ id, percent }) =>
        document.querySelector(`[data-feature-id="${id}"]`)?.dataset.progress === String(percent),
      { id: feature.id, percent: (index + 1) * 10 },
    );
    await page.waitForFunction(() => !document.querySelector(".roadmap-story-list input:disabled"));
  }
  assert.equal((await savedTask(feature.id)).story_progress.percent, 100);
  assert.equal(
    await bar
      .locator(".roadmap-progress-fill")
      .evaluate((element) => getComputedStyle(element).opacity),
    "1",
  );
  await page
    .getByRole("checkbox", { name: `Complete story: ${name} story 9`, exact: true })
    .uncheck();
  await page.waitForFunction(
    (id) => document.querySelector(`[data-feature-id="${id}"]`)?.dataset.progress === "90",
    feature.id,
  );
  await page.waitForFunction(() => !document.querySelector(".roadmap-story-list input:disabled"));
  await page.getByRole("button", { name: "Link existing", exact: true }).click();
  await dialog
    .locator(".roadmap-story-options")
    .getByRole("checkbox", { name: new RegExp(`^${unassigned.title}`) })
    .check();
  await dialog.getByRole("button", { name: "Save feature", exact: true }).click();
  await page.waitForFunction(
    (id) => document.querySelector(`[data-feature-id="${id}"]`)?.dataset.progress === "82",
    feature.id,
  );
  assert.equal((await savedTask(feature.id)).story_progress.total, 11);
  await page.getByRole("textbox", { name: "New user story name" }).fill(`${name} created in UI`);
  const newStoryResponse = page.waitForResponse(
    (result) =>
      result.request().method() === "POST" && new URL(result.url()).pathname === "/tasks/",
  );
  await page.getByRole("button", { name: "Add story", exact: true }).click();
  createdIds.add((await (await newStoryResponse).json()).id);
  await page.waitForFunction(
    (id) => document.querySelector(`[data-feature-id="${id}"]`)?.dataset.progress === "75",
    feature.id,
  );
  console.log(
    "PASS: linked and newly created stories drive 10/90/100% fills; reopening a story lowers progress.",
  );

  await page.reload();
  await bar.waitFor();
  assert.equal(await bar.getAttribute("data-progress"), "75");
  assert.equal(
    await bar.evaluate((element) => element.style.getPropertyValue("--feature-color")),
    "#db2777",
  );
  assert.equal((await savedTask(feature.id)).due_date, "2026-12-02");
  const beforeFailure = await savedTask(feature.id);
  await page.route(`${api}/tasks/${feature.id}/`, (route) =>
    route.fulfill({ status: 503, json: { detail: "Temporary schedule save failure" } }),
  );
  await drag(bar.locator(".roadmap-bar-body"), 40, false);
  await page.getByRole("alert").filter({ hasText: "Temporary schedule save failure" }).waitFor();
  assert.equal((await savedTask(feature.id)).planned_start_date, beforeFailure.planned_start_date);
  await page.unroute(`${api}/tasks/${feature.id}/`);
  console.log(
    "PASS: colors, dates and story progress survive reload; failed drag saves restore previous dates.",
  );

  const calendar = page.getByRole("region", { name: "Roadmap calendar", exact: true });
  async function panCalendar(direction, times = 1) {
    await calendar.scrollIntoViewIfNeeded();
    for (let index = 0; index < times; index++) {
      const bounds = await calendar.boundingBox();
      const body = await page.locator(".roadmap-calendar-body").boundingBox();
      const y = Math.min(body.y + body.height - 7, bounds.y + bounds.height - 14);
      const x = bounds.x + bounds.width * (direction === "future" ? 0.8 : 0.2);
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + bounds.width * (direction === "future" ? -0.5 : 0.5), y, {
        steps: 12,
      });
      await page.mouse.up();
    }
  }
  await page.getByRole("button", { name: "Month scale", exact: true }).click();
  const originalYear = Number(
    (await page.locator(".roadmap-calendar-year").innerText()).slice(0, 4),
  );
  let navigationWrites = 0;
  const countWrites = (request) => {
    if (request.method() === "PATCH" && request.url().startsWith(`${api}/tasks/`))
      navigationWrites++;
  };
  page.on("request", countWrites);
  await panCalendar("future", 3);
  assert(
    Number((await page.locator(".roadmap-calendar-year").innerText()).slice(0, 4)) > originalYear,
  );
  await page.getByRole("button", { name: "Add feature", exact: true }).click();
  const futureStart = await dialog.getByLabel("Planned start", { exact: true }).inputValue();
  assert(futureStart > "2027-01-01");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await panCalendar("past", 6);
  assert(
    Number((await page.locator(".roadmap-calendar-year").innerText()).slice(0, 4)) < originalYear,
  );
  const bounds = await calendar.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(bounds.width * 4, 0);
  await page.waitForFunction(
    (year) =>
      Number(document.querySelector(".roadmap-calendar-year").textContent.slice(0, 4)) > year,
    originalYear,
  );
  const body = await page.locator(".roadmap-calendar-body").boundingBox();
  await page.mouse.dblclick(
    bounds.x + bounds.width / 2,
    Math.min(body.y + body.height - 7, bounds.y + bounds.height - 14),
  );
  await dialog.waitFor();
  const clickedStart = await dialog.getByLabel("Planned start", { exact: true }).inputValue();
  assert(clickedStart > "2027-01-01");
  await dialog.getByLabel("Feature name", { exact: true }).fill(`${name} future feature`);
  const futureResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && new URL(response.url()).pathname === "/tasks/",
  );
  await dialog.getByRole("button", { name: "Save feature", exact: true }).click();
  const future = await (await futureResponse).json();
  createdIds.add(future.id);
  assert.equal(future.planned_start_date, clickedStart);
  await page.locator(`[data-feature-id="${future.id}"]`).waitFor();
  assert.equal((await savedTask(feature.id)).planned_start_date, beforeFailure.planned_start_date);
  assert.equal(navigationWrites, 0);
  page.off("request", countWrites);
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.locator(".roadmap-today-overlay > b").waitFor();
  console.log(
    "PASS: continuous calendar panning into past/future, horizontal wheel navigation, future date defaults, double-click feature creation, and no schedule edits from navigation.",
  );

  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.waitForFunction(
    () => document.querySelector(".shell-sidebar").getBoundingClientRect().width < 80,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
  for (const scale of ["monthly", "quarterly", "yearly", "weekly"]) {
    await page
      .getByRole("button", {
        name: `${scale[0].toUpperCase() + scale.slice(1)} scale`,
        exact: true,
      })
      .click();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await page.route(`${api}/projects/`, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      json: (await response.json()).map((item) => ({ ...item, my_role: "viewer" })),
    });
  });
  await page.reload();
  await bar.waitFor();
  assert.equal(await page.locator(".roadmap-resize-handle").count(), 0);
  assert.equal(await bar.locator(".roadmap-bar-body").getAttribute("data-movable"), "false");
  assert(await page.getByRole("button", { name: "Add feature", exact: true }).isDisabled());
  const beforeReadOnlyPan = await page
    .locator(".product-roadmap-periods > span")
    .first()
    .innerText();
  await panCalendar("future", 2);
  assert.notEqual(
    await page.locator(".product-roadmap-periods > span").first().innerText(),
    beforeReadOnlyPan,
  );
  await calendar.focus();
  await calendar.press("Home");
  await page.locator(".roadmap-today-overlay > b").waitFor();
  await page.unroute(`${api}/projects/`);
  await page.route(`${api}/tasks/?project_id=*`, (route) => route.fulfill({ json: [] }));
  await page.reload();
  await calendar.waitFor();
  assert.equal(await page.locator(".roadmap-timeline-bar").count(), 0);
  await panCalendar("future", 2);
  await page.getByRole("button", { name: "Add feature", exact: true }).click();
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  assert.equal(await page.getByText("NaN%", { exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: mobile and read-only calendars still pan, empty projects support planning, protected feature editing stays disabled, and no browser errors.",
  );
} finally {
  if (headers)
    for (const id of createdIds)
      await context.request.delete(`${api}/tasks/${id}/`, { headers }).catch(() => undefined);
  await browser.close();
}
