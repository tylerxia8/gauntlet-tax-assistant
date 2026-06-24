const { test, expect } = require("@playwright/test");

test("happy path produces a filled 1040 PDF download", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".pillar-strip").getByText("Chat loop", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load fake W-2", exact: true }).click();
  await page.getByRole("button", { name: "Parse W-2", exact: true }).click();

  await page.getByPlaceholder("Reply to the assistant...").fill("single");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByPlaceholder("Reply to the assistant...").fill("yes");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByPlaceholder("Reply to the assistant...").fill("0");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByPlaceholder("Reply to the assistant...").fill("no dependent, no digital assets");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("1040 ready")).toBeVisible();
  await expect(page.getByText("Tax worksheet")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download 1040" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("2025-1040-jordan-lee.pdf");
});
