const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

const dom = new JSDOM(html, {
  url: `file://${root}/index.html`,
  runScripts: "dangerously",
  pretendToBeVisual: true,
});

dom.window.URL.createObjectURL = () => "blob:test-return";
dom.window.URL.revokeObjectURL = () => {};
dom.window.HTMLAnchorElement.prototype.click = () => {};
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

click("#loadDemoW2");
click("#parseW2");
submit("single");
submit("yes");
submit("0");
submit("no");

assert.match(text("#statusPill"), /1040 ready/);
assert.equal(dom.window.document.querySelector("#downloadReturn").disabled, false);
assert.match(text("#summaryList"), /Refund/);
assert.match(text("#observationList"), /tool.fill1040.ok/);
assert.ok(dom.window.document.querySelectorAll(".message.agent").length <= 7);

console.log("Harness smoke test passed.");
