import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const collectionKey = "hephaestus.collection.v1";
async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect.soft(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect.soft(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
}
async function expectAccessible(page: Page) {
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect
    .soft(
      audit.violations,
      JSON.stringify(
        audit.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          nodes: nodes.map(({ target, failureSummary }) => ({
            target,
            failureSummary,
          })),
        })),
        null,
        2,
      ),
    )
    .toEqual([]);
}

test("gallery → configured relic → independent share link → SVG download → local collection removal", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FORGED");
  await expect(page.getByRole("button", { name: "Motion off" })).toBeDisabled();
  const gallery = page.getByRole("group", { name: "Choose a relic study" });
  await gallery.getByRole("button", { name: /Nostos/ }).click();
  await expect(gallery.getByRole("button", { name: /Nostos/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "A reminder of the way back." }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Make this your own/ }).click();
  const intention = page.getByRole("group", { name: /An intention/ });
  const material = page.getByRole("group", { name: /A material/ });
  const mark = page.getByRole("group", { name: /A maker’s mark/ });
  await expect(
    intention.getByRole("button", { name: "Return", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await intention.getByRole("button", { name: "Begin", exact: true }).click();
  await material.getByRole("button", { name: "Obsidian", exact: true }).click();
  await mark.getByRole("button", { name: "Laurel", exact: true }).click();
  await expect(page.locator(".forge-summary")).toContainText(
    "Pyr · Obsidian · Laurel",
  );
  await expectAccessible(page);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/relics") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Forge my relic" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const record = await response.json();
  expect(record.recipe).toMatchObject({
    intention: "begin",
    material: "obsidian",
    mark: "laurel",
    version: 1,
  });
  await expect(
    page.getByRole("heading", { name: "Pyr, made yours." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View your relic" }),
  ).toHaveAttribute("href", record.url);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || "[]"),
    collectionKey,
  );
  expect(saved).toHaveLength(1);
  expect(saved[0].token).toBe(record.token);

  // A fresh browser context has neither the creator's storage nor cookies.
  const other = await browser.newContext({
    baseURL,
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 1000 },
  });
  try {
    const shared = await other.newPage();
    await shared.goto(record.url);
    await expect(
      shared.getByRole("heading", { level: 1, name: "Pyr" }),
    ).toBeVisible();
    await expect(shared.locator(".record-choices")).toContainText("Begin");
    await expect(shared.locator(".record-choices")).toContainText("Obsidian");
    await expect(shared.locator(".record-choices")).toContainText("Laurel");
    await expect(shared.locator(".record-meta")).toContainText(record.id);
    expect(
      await shared.evaluate((key) => localStorage.getItem(key), collectionKey),
    ).toBeNull();
    await expectAccessible(shared);
    const downloadPromise = shared.waitForEvent("download");
    await shared.getByRole("link", { name: "Download archival print" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      `hephaestus-${record.id.toLowerCase()}.svg`,
    );
    expect(await download.failure()).toBeNull();
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const svg = Buffer.concat(chunks).toString("utf8");
    expect(svg).toContain(record.id);
    expect(svg).toContain("OBSIDIAN / LAUREL");
    const xml = await shared.evaluate((source) => {
      const document = new DOMParser().parseFromString(source, "image/svg+xml");
      return {
        errors: document.querySelectorAll("parsererror").length,
        width: document.documentElement.getAttribute("width"),
        height: document.documentElement.getAttribute("height"),
      };
    }, svg);
    expect(xml).toEqual({ errors: 0, width: "1200", height: "1600" });
  } finally {
    await other.close();
  }

  await page.reload();
  await page.getByRole("button", { name: /Your collection/ }).click();
  await expect(
    page.getByRole("heading", { name: "Saved on this device" }),
  ).toBeVisible();
  await expect(
    page
      .locator("#saved-collection")
      .getByRole("link", { name: /Pyr · Obsidian · Laurel/ }),
  ).toHaveAttribute("href", record.url);
  await page
    .getByRole("button", {
      name: "Remove Pyr · Obsidian · Laurel from this device",
    })
    .click();
  await expect(page.locator("#saved-collection")).toContainText(
    "You haven’t forged a relic yet.",
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || "[]"),
      collectionKey,
    ),
  ).toEqual([]);
  // Device removal must never destroy the portable record.
  expect((await page.request.get(`/api/relics/${record.token}`)).status()).toBe(
    200,
  );
});

test("failed creation preserves choices, retry succeeds and a new choice invalidates the old result", async ({
  page,
}) => {
  await page.goto("/#forge");
  await page
    .getByRole("group", { name: /A material/ })
    .getByRole("button", { name: "Silver", exact: true })
    .click();
  await page
    .getByRole("group", { name: /A maker’s mark/ })
    .getByRole("button", { name: "Wave", exact: true })
    .click();
  await page.route("**/api/relics", (route) => route.abort("failed"), {
    times: 1,
  });
  await page.getByRole("button", { name: "Forge my relic" }).click();
  await expect(page.locator(".status.error")).toContainText(
    "We couldn’t reach the forge. Your choices are still here.",
  );
  await expect(page.locator(".forge-summary")).toContainText(
    "Aegis · Silver · Wave",
  );
  const retryResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/relics") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Try the forge again" }).click();
  expect((await retryResponse).status()).toBe(201);
  await expect(
    page.getByRole("heading", { name: "Aegis, made yours." }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: /An intention/ })
    .getByRole("button", { name: "Begin", exact: true })
    .click();
  await expect(page.getByRole("link", { name: "View your relic" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Forge my relic" }),
  ).toBeEnabled();
  await expect(page.locator(".forge-summary")).toContainText(
    "Pyr · Silver · Wave",
  );
});

test("reselecting the same gallery study resets intention and pending results cannot overwrite a new study", async ({
  page,
}) => {
  await page.goto("/");
  const intention = page.getByRole("group", { name: /An intention/ });
  const makeOwn = page.getByRole("link", { name: /Make this your own/ });
  await makeOwn.click();
  await expect(
    intention.getByRole("button", { name: "Protect", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await intention.getByRole("button", { name: "Begin", exact: true }).click();
  // Aegis is still selected in the gallery. Repeating its link must be a new action.
  await makeOwn.click();
  await expect(
    intention.getByRole("button", { name: "Protect", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await intention.getByRole("button", { name: "Begin", exact: true }).click();

  let releaseResponse = () => {};
  let markStarted = () => {};
  let markDelivered = () => {};
  const release = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const delivered = new Promise<void>((resolve) => {
    markDelivered = resolve;
  });
  await page.route(
    "**/api/relics",
    async (route) => {
      const response = await route.fetch();
      markStarted();
      await release;
      // The client is expected to abort this request when a different study wins.
      try {
        await route.fulfill({ response });
      } catch {
        /* Aborted browser request. */
      } finally {
        markDelivered();
      }
    },
    { times: 1 },
  );
  try {
    await page.getByRole("button", { name: "Forge my relic" }).click();
    await started;
    await expect(
      page.getByRole("button", { name: "Forging your relic…" }),
    ).toBeDisabled();
    await expect(
      intention.getByRole("button", { name: "Protect", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("group", { name: "Choose a relic study" })
      .getByRole("button", { name: /Nostos/ })
      .click();
    await makeOwn.click();
    await expect(
      intention.getByRole("button", { name: "Return", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Forge my relic" }),
    ).toBeEnabled();
    releaseResponse();
    await delivered;
    await expect(
      page.getByRole("link", { name: "View your relic" }),
    ).toHaveCount(0);
    await expect(page.locator(".status.error")).toHaveCount(0);
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/relics") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Forge my relic" }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect((await response.json()).recipe.intention).toBe("return");
    await expect(
      page.getByRole("heading", { name: "Nostos, made yours." }),
    ).toBeVisible();
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || "[]"),
      collectionKey,
    );
    expect(saved).toHaveLength(1);
    expect(saved[0].recipe.intention).toBe("return");
  } finally {
    releaseResponse();
  }
});

for (const width of [390, 320]) {
  test(`mobile ${width}px: keyboard menu, reduced motion, keyboard choices and no horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Motion off" }),
    ).toBeDisabled();
    await expectNoOverflow(page);
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Close", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    const navigation = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await page.keyboard.press("Tab");
    await expect(
      navigation.getByRole("link", { name: "The atelier" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(navigation).toHaveCount(0);
    await menu.focus();
    await page.keyboard.press("Enter");
    const forgeLink = page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Enter the forge" });
    await forgeLink.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toHaveCount(0);
    await expect(page.locator("#forge")).toBeFocused();
    await expectNoOverflow(page);
    const returnChoice = page
      .getByRole("group", { name: /An intention/ })
      .getByRole("button", { name: "Return", exact: true });
    await returnChoice.focus();
    await page.keyboard.press("Space");
    await expect(returnChoice).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".forge-summary")).toContainText(
      "Nostos · Bronze · Sun",
    );
    await page
      .getByRole("button", { name: "Your collection", exact: false })
      .click();
    await expectNoOverflow(page);
    await expectAccessible(page);
  });
}

test("invalid share links show a useful recovery route and API returns 404", async ({
  page,
}) => {
  await page.goto("/relic/not-a-valid-relic");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "have missing pieces.",
  );
  await expect(
    page.getByRole("link", { name: "Return to the atelier" }),
  ).toHaveAttribute("href", "/");
  expect(
    (await page.request.get("/api/relics/not-a-valid-relic")).status(),
  ).toBe(404);
  expect(
    (await page.request.get("/api/relics/not-a-valid-relic/print")).status(),
  ).toBe(404);
  await page.getByRole("link", { name: "Return to the atelier" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FORGED");
});
