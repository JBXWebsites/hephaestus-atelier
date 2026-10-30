import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: [
    "--enable-webgl",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
await mkdir("artifacts/screenshots", { recursive: true });
for (const [name, width, height, reducedMotion] of [
  ["desktop", 1440, 1000, "no-preference"],
  ["mobile", 390, 844, "reduce"],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion,
  });
  page.on("pageerror", (e) => console.log(name, "ERROR", e.message));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  for (const [label, selector] of [
    ["hero", ".hero"],
    ["maker", ".maker"],
    ["collection", ".collection"],
    ["invocation", ".invocation"],
    ["forge", ".forge"],
    ["workbench", ".workbench"],
    ["close", ".closing"],
  ]) {
    await page
      .locator(selector)
      .evaluate((el) =>
        window.scrollTo(
          0,
          el.getBoundingClientRect().top + window.scrollY - 84,
        ),
      );
    await page.waitForTimeout(1800);
    console.log(
      name,
      label,
      await page
        .locator(selector)
        .evaluate((el) => ({
          y: window.scrollY,
          top: el.getBoundingClientRect().top,
        })),
    );
    await page.screenshot({
      path: `artifacts/screenshots/${name}-${label}.png`,
    });
  }
  console.log(
    name,
    "overflow",
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  );
  await page.close();
}
await browser.close();
