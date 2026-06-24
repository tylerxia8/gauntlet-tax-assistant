const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
  },
  webServer: {
    command: "node server.js",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 15000,
  },
});
