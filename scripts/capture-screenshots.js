const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { chromium } = require("@playwright/test");

const baseUrl = "http://127.0.0.1:4173";
const screenshotDir = "screenshots";

async function serverReady() {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    if (await serverReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Local server did not start on port 4173.");
}

async function startServerIfNeeded() {
  if (await serverReady()) return null;
  const child = spawn(process.execPath, ["server.js"], {
    stdio: "ignore",
    windowsHide: true,
  });
  await waitForServer();
  return child;
}

async function driveHappyPath(page) {
  await page.getByRole("button", { name: "Load fake W-2", exact: true }).click();
  await page.getByRole("button", { name: "Parse W-2", exact: true }).click();
  await page.locator("#chatInput").fill("single");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("#chatInput").fill("yes");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("#chatInput").fill("0");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator("#chatInput").fill("no dependent, no digital assets");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByText("1040 ready").waitFor();
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const server = await startServerIfNeeded();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(baseUrl);
    await page.screenshot({ path: `${screenshotDir}/chat-harness.png`, fullPage: true });
    await driveHappyPath(page);
    await page.screenshot({ path: `${screenshotDir}/return-ready.png`, fullPage: true });

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 1100 }, isMobile: true });
    await mobilePage.goto(baseUrl);
    await driveHappyPath(mobilePage);
    await mobilePage.screenshot({ path: `${screenshotDir}/mobile-return-ready.png`, fullPage: true });
    await mobilePage.close();
  } finally {
    await browser.close();
    if (server) server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
