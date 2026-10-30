import { expect, test, type Locator, type Page } from "@playwright/test";

// Unlike locator.click(), this helper never scrolls an element into view. A
// transformed ScrollSmoother page must first put its controls on screen itself.
async function physicalClick(page: Page, target: Locator) {
  let previous: { x: number; y: number } | null = null;
  await expect
    .poll(
      async () => {
        const box = await target.boundingBox();
        const viewport = page.viewportSize()!;
        if (!box) return false;
        const stable =
          !!previous &&
          Math.abs(box.x - previous.x) < 0.5 &&
          Math.abs(box.y - previous.y) < 0.5;
        previous = box;
        const visible =
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= viewport.width + 1 &&
          box.y + box.height <= viewport.height + 1;
        if (!stable || !visible) return false;
        return target.evaluate(
          (node, point) =>
            node.contains(document.elementFromPoint(point.x, point.y)),
          { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        );
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  const box = (await target.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function ready(page: Page, reducedMotion: "reduce" | "no-preference") {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  if (reducedMotion === "reduce") {
    await expect(
      page.getByRole("button", { name: "Motion off" }),
    ).toBeDisabled();
  } else {
    await expect
      .poll(() =>
        page
          .locator("#smooth-wrapper")
          .evaluate((node) => getComputedStyle(node).position),
      )
      .toBe("fixed");
  }
}

async function scrollBottom(page: Page) {
  // Reaching the lower page triggers the lazy scene, which can grow the document
  // after the first scroll. Continue natural scrolling until the real footer,
  // content height and scene have settled; do not force a smoother transform.
  let previous: { height: number; footerBottom: number } | null = null;
  await expect
    .poll(
      async () => {
        const state = await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
          const wrapper = document.querySelector("#smooth-wrapper");
          const content =
            document.querySelector<HTMLElement>("#smooth-content");
          const footer = document
            .querySelector(".site-footer")!
            .getBoundingClientRect();
          const height = document.documentElement.scrollHeight;
          return {
            height,
            footerBottom: footer.bottom,
            footerTop: footer.top,
            viewport: innerHeight,
            bottomDistance: Math.abs(height - innerHeight - scrollY),
            heightDifference:
              wrapper &&
              content &&
              getComputedStyle(wrapper).position === "fixed"
                ? Math.abs(height - content.offsetHeight)
                : 0,
            sceneReady: !!document.querySelector(".forge .relic-scene"),
          };
        });
        const stable =
          !!previous &&
          previous.height === state.height &&
          Math.abs(previous.footerBottom - state.footerBottom) < 1;
        previous = state;
        return (
          stable &&
          state.sceneReady &&
          state.heightDifference < 4 &&
          state.bottomDistance < 4 &&
          state.footerTop >= 0 &&
          state.footerBottom <= state.viewport + 2
        );
      },
      { timeout: 15_000, intervals: [100, 150, 250] },
    )
    .toBe(true);
}

async function expectAtTop(page: Page) {
  await expect
    .poll(() => page.evaluate(() => scrollY), { timeout: 5_000 })
    .toBeLessThanOrEqual(2);
  await expect
    .poll(
      () =>
        page
          .locator(".hero")
          .evaluate((node) => Math.abs(node.getBoundingClientRect().top)),
      { timeout: 5_000 },
    )
    .toBeLessThanOrEqual(2);
  expect(new URL(page.url()).hash).toBe("");
}

async function expectAnchorVisible(page: Page, selector: string) {
  await expect
    .poll(
      () =>
        page.evaluate((target) => {
          const node = document.querySelector(target)!;
          const header = document.querySelector("header")!;
          const top = node.getBoundingClientRect().top;
          const headerBottom = header.getBoundingClientRect().bottom;
          return top >= headerBottom - 3 && top <= headerBottom + 100;
        }, selector),
      { timeout: 7_000 },
    )
    .toBe(true);
}

for (const motion of ["reduce", "no-preference"] as const) {
  test.describe(`navigation with ${motion}`, () => {
    test.use({ reducedMotion: motion });

    test("header logo returns to the top after natural scrolling with no URL hash", async ({
      page,
    }) => {
      await ready(page, motion);
      await page.mouse.move(900, 500);
      await page.mouse.wheel(0, 1800);
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeGreaterThan(1000);
      expect(new URL(page.url()).pathname).toBe("/");
      expect(new URL(page.url()).hash).toBe("");
      await physicalClick(page, page.locator(".site-header .brand"));
      await expectAtTop(page);
    });

    test("anchor navigation respects the fixed header and the logo clears the anchor", async ({
      page,
    }) => {
      await ready(page, motion);
      await physicalClick(page, page.locator(".site-header .header-cta"));
      await expect(page).toHaveURL(/#forge$/);
      await expectAnchorVisible(page, "#forge");
      await expect(page.locator("#forge")).toBeFocused();
      await physicalClick(page, page.locator(".site-header .brand"));
      await expectAtTop(page);
    });

    test("footer wordmark returns to the top after naturally reaching the footer", async ({
      page,
    }) => {
      await ready(page, motion);
      await scrollBottom(page);
      await physicalClick(page, page.locator(".footer-wordmark"));
      await expectAtTop(page);
    });
  });
}

test("mobile Escape closes the menu and returns focus to its trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "reduce");
  const toggle = page.locator(".menu-toggle");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "The atelier" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await expect.soft(toggle).toBeFocused();
  // Escape should work immediately after opening, before tabbing into the menu.
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("turning motion off and on preserves the current reading position and preference", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await ready(page, "no-preference");
  await scrollBottom(page);
  const toggle = page.getByRole("button", { name: "Motion on" });
  await physicalClick(page, toggle);
  await expect(
    page.getByRole("button", { name: "Motion off" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page
        .locator("#smooth-wrapper")
        .evaluate((node) => getComputedStyle(node).position),
    )
    .not.toBe("fixed");
  // A mode change must not strand a reader at another part of this long page.
  await expect(page.locator(".site-footer")).toBeInViewport();
  expect(
    await page.evaluate(() => localStorage.getItem("hephaestus.motion")),
  ).toBe("off");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Motion off" }),
  ).toHaveAttribute("aria-pressed", "true");
  await scrollBottom(page);
  await physicalClick(page, page.getByRole("button", { name: "Motion off" }));
  await expect(page.getByRole("button", { name: "Motion on" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect
    .poll(() =>
      page
        .locator("#smooth-wrapper")
        .evaluate((node) => getComputedStyle(node).position),
    )
    .toBe("fixed");
  await expect(page.locator(".site-footer")).toBeInViewport();
  expect(
    await page.evaluate(() => localStorage.getItem("hephaestus.motion")),
  ).toBe("on");
});

test("saved collection opens a record and Create another lands on the forge with desktop motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const response = await page.request.post("/api/relics", {
    data: { intention: "return", material: "silver", mark: "wave" },
  });
  expect(response.status()).toBe(201);
  const record = await response.json();
  await page.addInitScript(
    (saved) =>
      localStorage.setItem("hephaestus.collection.v1", JSON.stringify([saved])),
    record,
  );
  await ready(page, "no-preference");
  await scrollBottom(page);
  await physicalClick(
    page,
    page.getByRole("button", { name: /Your collection/ }),
  );
  await expect(page.locator("#saved-collection")).toBeVisible();
  await scrollBottom(page);
  await physicalClick(
    page,
    page.locator("#saved-collection").getByRole("link", { name: /Nostos/ }),
  );
  await expect(page).toHaveURL(new RegExp(`/relic/${record.token}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: "Nostos" }),
  ).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await physicalClick(page, page.getByRole("link", { name: "Create another" }));
  await expect(page).toHaveURL(/\/#forge$/);
  await expect
    .poll(() =>
      page
        .locator("#smooth-wrapper")
        .evaluate((node) => getComputedStyle(node).position),
    )
    .toBe("fixed");
  await expectAnchorVisible(page, "#forge");
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
]) {
  test.describe(`sticky mobile forge ${viewport.width}px`, () => {
    test.use({
      viewport,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    test("keyboard choices stay exposed below the preview and every mark accepts touch", async ({
      page,
    }) => {
      await page.goto("/#forge");
      await expect(page.locator(".forge .relic-scene")).toBeVisible();
      await page.locator("#forge").focus();
      const reached: string[] = [];
      for (let index = 0; index < 16 && reached.length < 9; index++) {
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => {
          const element = document.activeElement as HTMLElement;
          const box = element.getBoundingClientRect();
          const preview = document
            .querySelector(".forge-object")!
            .getBoundingClientRect();
          return {
            isChoice: element.matches(".forge-controls .choice"),
            label: element.textContent?.trim() || "",
            top: box.top,
            bottom: box.bottom,
            previewBottom: preview.bottom,
            height: innerHeight,
            exposed: element.contains(
              document.elementFromPoint(
                box.left + box.width / 2,
                box.top + box.height / 2,
              ),
            ),
          };
        });
        if (!focused.isChoice) continue;
        reached.push(focused.label);
        expect
          .soft(
            focused.exposed,
            `${focused.label} must receive a pointer at its visible center`,
          )
          .toBe(true);
        expect
          .soft(
            focused.top,
            `${focused.label} must be below the sticky preview`,
          )
          .toBeGreaterThanOrEqual(focused.previewBottom - 1);
        expect
          .soft(focused.bottom, `${focused.label} must be inside the viewport`)
          .toBeLessThanOrEqual(focused.height + 1);
      }
      expect(reached).toEqual([
        "Protect",
        "Begin",
        "Return",
        "Bronze",
        "Obsidian",
        "Silver",
        "Sun",
        "Wave",
        "Laurel",
      ]);
      const marks = page.getByRole("group", { name: /A maker’s mark/ });
      for (const name of ["Sun", "Wave", "Laurel"]) {
        const button = marks.getByRole("button", { name, exact: true });
        // Native scroll positions the target below the overlay; no locator
        // auto-scroll or synthetic click can hide a real touch interception.
        await button.evaluate((element) => {
          const preview = document
            .querySelector(".forge-object")!
            .getBoundingClientRect();
          window.scrollBy(
            0,
            element.getBoundingClientRect().top - preview.bottom - 24,
          );
        });
        const box = (await button.boundingBox())!;
        await page.touchscreen.tap(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        await expect(button).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(".forge-summary")).toContainText(name);
      }
    });
  });
}
