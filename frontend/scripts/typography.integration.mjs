import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

// Creates a fresh account. Use a disposable development database.
const api = process.env.TASKFLOW_TEST_API_URL ?? "http://localhost:8000";
const app = process.env.TASKFLOW_TEST_APP_URL ?? "http://localhost:5174";
const output = process.env.TASKFLOW_TEST_OUTPUT_DIR ?? join(tmpdir(), "taskflow-typography-check");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1536, height: 1050 } });
await context.grantPermissions(["local-fonts"], { origin: app });
const email = `font-check-${Date.now()}@example.test`;
const password = "Taskflow-Fonts-2026!";
const registration = await context.request.post(`${api}/accounts/register/`, {
  data: {
    email,
    job_title: "Founder",
    organization_name: "Typography Studio",
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
}, auth);
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
const downloadedFonts = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (request.resourceType() === "font") downloadedFonts.push(request.url());
});
const path = "/settings/administration/font-and-size";
const applied = () =>
  page.getByText("Font and size applied. Your preferences are saved.", { exact: true }).waitFor();
const rootSize = () =>
  page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
async function openSettings() {
  await page.goto(`${app}${path}`);
  await page.getByTestId("font-settings").waitFor();
}
try {
  await page.goto(`${app}/my-work`);
  const heading = page.getByRole("heading", { name: "My Work", exact: true });
  await heading.waitFor();
  const originalHeadingSize = await heading.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  );
  await page.goto(`${app}/settings/administration`);
  await page
    .getByRole("region", { name: "Administration options" })
    .getByRole("link", { name: /^Font & Size\b/ })
    .click();
  await page.getByTestId("font-settings").waitFor();
  assert.equal(await page.getByRole("spinbutton", { name: "Base font size" }).inputValue(), "16");
  assert.equal(await page.getByLabel("Font family", { exact: true }).inputValue(), "");
  assert.equal(await rootSize(), 16);
  const originalNavSize = await page
    .getByTestId("nav-settings")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const loadButton = page.getByRole("button", { name: "Load installed fonts", exact: true });
  if (await loadButton.isEnabled()) {
    await loadButton.click();
    await page.getByText(/installed font families loaded\./).waitFor();
  }
  const families = await page
    .locator("#taskflow-local-fonts option")
    .evaluateAll((elements) => elements.map((element) => element.value));
  assert(families.length > 0, "At least one installed font must be detected.");
  const chosenFont =
    ["Consolas", "Georgia", "Courier New", "Arial"].find((font) => families.includes(font)) ??
    families[0];
  await page.getByLabel("Font family", { exact: true }).fill(chosenFont);
  await page.getByRole("spinbutton", { name: "Base font size" }).fill("20");
  assert.equal(await rootSize(), 16, "Draft settings must not change application text.");
  assert.equal(
    await page
      .getByTestId("font-preview")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "20px",
  );
  await page.getByRole("button", { name: "Apply font & size", exact: true }).click();
  await applied();
  assert.equal(await rootSize(), 20);
  const nav = await page.getByTestId("nav-settings").evaluate((element) => ({
    family: getComputedStyle(element).fontFamily,
    size: Number.parseFloat(getComputedStyle(element).fontSize),
  }));
  assert(nav.family.includes(chosenFont));
  assert(
    Math.abs(nav.size - originalNavSize * 1.25) < 0.05,
    "Fixed CSS font sizes must scale with the base size.",
  );
  await page.goto(`${app}/my-work`);
  await page.getByRole("heading", { name: "My Work", exact: true }).waitFor();
  await page.waitForFunction(
    () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) === 20,
  );
  const headingSize = await heading.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  );
  assert(
    Math.abs(headingSize - originalHeadingSize * 1.25) < 0.05,
    "The My Work heading must scale with the base size.",
  );
  await openSettings();
  await page.reload();
  await page.getByTestId("font-settings").waitFor();
  assert.equal(await page.getByLabel("Font family", { exact: true }).inputValue(), chosenFont);
  assert.equal(await rootSize(), 20);
  console.log(
    `PASS: local installed font ${chosenFont} is selectable; preview is separate; applying updates CSS/rem text and persists across pages and reload.`,
  );

  await page.getByLabel("Font family", { exact: true }).fill("NotAnInstalledTaskflowFont12345");
  assert.equal(
    await page.getByRole("button", { name: "Apply font & size", exact: true }).isDisabled(),
    true,
  );
  await page.getByLabel("Font family", { exact: true }).fill(chosenFont);
  await page.getByRole("spinbutton", { name: "Base font size" }).fill("25");
  assert.equal(
    await page.getByRole("button", { name: "Apply font & size", exact: true }).isDisabled(),
    true,
  );
  await page.getByRole("spinbutton", { name: "Base font size" }).fill("18");
  await page.route("**/accounts/me/typography/", async (route) => {
    if (route.request().method() === "PUT")
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Temporary font save failure" }),
      });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Apply font & size", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Temporary font save failure" }).waitFor();
  assert.equal(await rootSize(), 20, "A failed save must preserve the applied typography.");
  await page.unroute("**/accounts/me/typography/");
  await page.getByRole("button", { name: "Reset to defaults", exact: true }).click();
  assert.equal(await rootSize(), 20);
  await page.getByRole("button", { name: "Apply font & size", exact: true }).click();
  await applied();
  assert.equal(await rootSize(), 16);
  assert.equal(
    await page
      .getByTestId("nav-settings")
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    originalNavSize,
  );
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--taskflow-font-family"),
    ),
    "",
  );
  if (await loadButton.isEnabled()) {
    await page.evaluate(() =>
      Object.defineProperty(window, "queryLocalFonts", {
        configurable: true,
        value: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      }),
    );
    await loadButton.click();
    await page.getByText(/Font access wasn’t allowed/).waitFor();
    await page.getByLabel("Font family", { exact: true }).fill(chosenFont);
    await page.getByRole("spinbutton", { name: "Base font size" }).fill("20");
    await page.getByRole("button", { name: "Apply font & size", exact: true }).click();
    await applied();
  }
  console.log(
    "PASS: unavailable fonts and invalid sizes are blocked; failed saves retain applied settings; reset restores defaults; permission denial retains detected-font choices.",
  );

  await context.addInitScript(() =>
    Object.defineProperty(window, "queryLocalFonts", { configurable: true, value: undefined }),
  );
  await openSettings();
  assert.equal(await loadButton.isDisabled(), true);
  const fallbackFamilies = await page.locator("#taskflow-local-fonts option").count();
  assert(fallbackFamilies > 0, "Font detection must work when the listing API is unavailable.");
  await page.getByLabel("Font family", { exact: true }).fill(chosenFont);
  await page.getByRole("spinbutton", { name: "Base font size" }).fill("20");
  if (await page.getByRole("button", { name: "Apply font & size", exact: true }).isEnabled()) {
    await page.getByRole("button", { name: "Apply font & size", exact: true }).click();
    await applied();
  }
  const headers = await page.evaluate(() => ({
    Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
    "X-Organization-ID": sessionStorage.getItem("active_organization_id"),
  }));
  assert.equal(
    (
      await context.request.post(`${api}/accounts/organizations/`, {
        headers,
        data: { name: "Second Company" },
      })
    ).status(),
    201,
  );
  await page.reload();
  await page.getByTestId("font-settings").waitFor();
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("button", { name: "Second Company", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await openSettings();
  assert.equal(await page.getByLabel("Font family", { exact: true }).inputValue(), "");
  assert.equal(await rootSize(), 16);
  await page.getByTestId("organization-switcher").click();
  await page.getByRole("button", { name: "Typography Studio", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await openSettings();
  assert.equal(await page.getByLabel("Font family", { exact: true }).inputValue(), chosenFont);
  assert.equal(await rootSize(), 20);
  await page.screenshot({ path: join(output, "font-settings.png"), fullPage: true });
  await page.evaluate(() => localStorage.setItem("taskflow_theme", "night"));
  await page.reload();
  await page.getByTestId("font-settings").waitFor();
  await page.screenshot({ path: join(output, "font-settings-dark.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await page.waitForFunction(() =>
    getComputedStyle(document.querySelector(".app-shell")).gridTemplateColumns.startsWith("76px"),
  );
  await page.screenshot({ path: join(output, "font-settings-mobile.png"), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole("button", { name: /^Open account menu/ }).click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/login");
  assert.equal(await rootSize(), 16, "Logging out must clear account typography.");
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--taskflow-font-family"),
    ),
    "",
  );
  assert.deepEqual(downloadedFonts, []);
  assert.deepEqual(errors, []);
  console.log(
    `PASS: fallback fonts, organization isolation, dark/mobile layout and logout cleanup work; no font files are downloaded. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
