const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const PDFLib = require("pdf-lib");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

const dom = new JSDOM(html, {
  url: `file://${root}/index.html`,
  runScripts: "dangerously",
  pretendToBeVisual: true,
});

let capturedBlob = null;
let capturedDownload = null;
dom.window.PDFLib = PDFLib;
dom.window.fetch = async (url) => {
  assert.equal(url, "./assets/f1040-2025.pdf");
  const bytes = fs.readFileSync(path.join(root, "assets", "f1040-2025.pdf"));
  return {
    ok: true,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
};
dom.window.URL.createObjectURL = (blob) => {
  capturedBlob = blob;
  return "blob:test-return";
};
dom.window.URL.revokeObjectURL = () => {};
dom.window.HTMLAnchorElement.prototype.click = function clickDownload() {
  capturedDownload = this.download;
};
dom.window.eval(app);

function text(selector) {
  return dom.window.document.querySelector(selector).textContent;
}

function click(selector) {
  dom.window.document.querySelector(selector).click();
}

function submit(message) {
  const input = dom.window.document.querySelector("#chatInput");
  input.value = message;
  dom.window.document.querySelector("#chatForm").dispatchEvent(
    new dom.window.Event("submit", { bubbles: true, cancelable: true })
  );
}

async function waitFor(predicate, label) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

(async () => {
  click("#loadDemoW2");
  click("#parseW2");
  submit("single");
  submit("yes");
  submit("yes");
  submit("no dependent, no digital assets");

  assert.match(text("#statusPill"), /1040 ready/);
  assert.equal(dom.window.document.querySelector("#downloadReturn").disabled, false);
  assert.match(text("#summaryList"), /Refund/);
  assert.match(text("#observationList"), /tool.fill1040.ok/);
  assert.ok(dom.window.document.querySelectorAll(".message.agent").length <= 7);

  click("#downloadReturn");
  await waitFor(() => capturedDownload, "download link click");

  assert.match(capturedDownload, /2025-1040-jordan-lee\.pdf/);
  assert.equal(capturedBlob.type, "application/pdf");
  assert.match(text("#observationList"), /tool.download1040/);

  console.log("Harness smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
