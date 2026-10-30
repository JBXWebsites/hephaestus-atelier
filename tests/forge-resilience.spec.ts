import { expect, test } from "@playwright/test";

test("clipboard denial exposes a selectable link, while successful retry announces copying", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          Promise.reject(
            new DOMException("Permission denied", "NotAllowedError"),
          ),
      },
    });
  });
  await page.goto("/#forge");
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/relics") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Forge my relic" }).click();
  const record = await (await responsePromise).json();
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  const address = page.getByRole("textbox", {
    name: "Your relic’s share link",
  });
  await expect(address).toHaveValue(new URL(record.url, page.url()).href);
  await expect(address).toHaveAttribute("readonly", "");
  await expect(page.locator(".forge-result").getByRole("status")).toContainText(
    "Select and copy the address below.",
  );
  await address.focus();
  expect(
    await address.evaluate(
      (input: HTMLInputElement) =>
        input.selectionStart === 0 && input.selectionEnd === input.value.length,
    ),
  ).toBe(true);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    }),
  );
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Link copied", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".forge-result").getByRole("status")).toHaveText(
    "Your share link is on the clipboard.",
  );
  await expect(address).toHaveCount(0);
});

test("server validation messages stay useful while unknown response text and malformed records stay hidden", async ({
  page,
}) => {
  await page.goto("/#forge");
  await page
    .getByRole("group", { name: /A material/ })
    .getByRole("button", { name: "Silver", exact: true })
    .click();
  const cases = [
    {
      status: 400,
      body: { error: "Choose a valid intention, material and maker’s mark." },
      expected: "Choose a valid intention, material and maker’s mark.",
    },
    {
      status: 400,
      body: { error: "<script>private server internals</script>" },
      expected: "The forge could not complete your request.",
    },
    {
      status: 500,
      body: { error: "private server internals" },
      expected: "The forge is temporarily unavailable.",
    },
    {
      status: 201,
      body: { url: "https://unexpected.example", recipe: {} },
      expected: "The forge returned an incomplete record.",
    },
  ];
  for (const failure of cases) {
    await page.route(
      "**/api/relics",
      (route) =>
        route.fulfill({
          status: failure.status,
          contentType: "application/json",
          body: JSON.stringify(failure.body),
        }),
      { times: 1 },
    );
    await page
      .getByRole("button", { name: /^(Forge my relic|Try the forge again)$/ })
      .click();
    await expect(page.locator(".status.error")).toContainText(failure.expected);
    await expect(page.locator(".status.error")).toContainText(
      "Your choices are still here.",
    );
    await expect(page.locator(".status.error")).not.toContainText(
      "private server internals",
    );
    await expect(page.locator(".forge-summary")).toContainText(
      "Aegis · Silver · Sun",
    );
    await expect(
      page.getByRole("link", { name: "View your relic" }),
    ).toHaveCount(0);
  }
});

test("a stalled forge request gives an explicit timeout and leaves retry available", async ({
  page,
}) => {
  await page.goto("/#forge");
  await expect(
    page.getByRole("button", { name: "Forge my relic" }),
  ).toBeVisible();
  await page.clock.install();
  await page.route("**/api/relics", () => {});
  await page.getByRole("button", { name: "Forge my relic" }).click();
  await expect(
    page.getByRole("button", { name: "Forging your relic…" }),
  ).toBeDisabled();
  await page.clock.fastForward(15_001);
  await expect(page.locator(".status.error")).toHaveText(
    "The forge took too long to respond. Your choices are still here. Please try again.",
  );
  await expect(
    page.getByRole("button", { name: "Try the forge again" }),
  ).toBeEnabled();
});
