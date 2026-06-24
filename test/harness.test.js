const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const PDFLib = require("pdf-lib");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

function createHarness() {
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

  return {
    dom,
    click(selector) {
      dom.window.document.querySelector(selector).click();
    },
    submit(message) {
      const input = dom.window.document.querySelector("#chatInput");
      input.value = message;
      dom.window.document.querySelector("#chatForm").dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true })
      );
    },
    text(selector) {
      return dom.window.document.querySelector(selector).textContent;
    },
    setW2(value) {
      dom.window.document.querySelector("#w2Text").value = value;
    },
    downloadState() {
      return { capturedBlob, capturedDownload };
    },
  };
}

async function waitFor(predicate, label) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function assertPdfDownload(harness) {
  harness.click("#downloadReturn");
  await waitFor(() => harness.downloadState().capturedDownload, "download link click");
  const { capturedBlob, capturedDownload } = harness.downloadState();
  assert.match(capturedDownload, /2025-1040-jordan-lee\.pdf/);
  assert.equal(capturedBlob.type, "application/pdf");
  assert.match(harness.text("#observationList"), /tool.download1040/);
}

async function testSingleFlow() {
  const harness = createHarness();
  harness.click("#loadDemoW2");
  harness.click("#parseW2");
  harness.submit("single");
  harness.submit("yes");
  harness.submit("yes");
  harness.submit("no dependent, no digital assets");

  assert.match(harness.text("#statusPill"), /1040 ready/);
  assert.equal(harness.dom.window.document.querySelector("#downloadReturn").disabled, false);
  assert.match(harness.text("#summaryList"), /Refund/);
  assert.match(harness.text("#observationList"), /tool.fill1040.ok/);
  assert.ok(harness.dom.window.document.querySelectorAll(".message.agent").length <= 7);

  await assertPdfDownload(harness);
}

async function testMarriedJointFlowWaitsForFifthAnswer() {
  const harness = createHarness();
  harness.click("#loadDemoW2");
  harness.click("#parseW2");
  harness.submit("married filing jointly");
  harness.submit("5000 wages, 250 withheld");
  harness.submit("yes");
  harness.submit("yes");

  assert.match(harness.text("#statusPill"), /Question 5 of 5/);
  assert.equal(harness.dom.window.document.querySelector("#downloadReturn").disabled, true);
  assert.doesNotMatch(harness.text("#observationList"), /tool.fill1040.ok/);

  harness.submit("no one can claim me, no digital assets");
  assert.match(harness.text("#statusPill"), /1040 ready/);
  assert.match(harness.text("#summaryList"), /Married filing jointly/);
  assert.match(harness.text("#summaryList"), /\$45,250/);

  await assertPdfDownload(harness);
}

function testBadW2Rejected() {
  const harness = createHarness();
  harness.setW2(JSON.stringify({
    taxYear: 2024,
    employeeName: "Jordan Lee",
    employeeSsn: "123-45-6789",
    employerName: "Brightline Supply Co.",
    wages: 40250,
    federalWithholding: 3450,
  }));
  harness.click("#parseW2");

  assert.match(harness.text("#messages"), /W-2 must be for tax year 2025/);
  assert.match(harness.text("#observationList"), /guardrail.w2.reject/);
  assert.equal(harness.dom.window.document.querySelector("#downloadReturn").disabled, true);
}

function testDependentGuardrailRecovery() {
  const harness = createHarness();
  harness.click("#loadDemoW2");
  harness.click("#parseW2");
  harness.submit("single");
  harness.submit("yes");
  harness.submit("2 kids");

  assert.match(harness.text("#messages"), /Dependent credits need full dependent details/);
  assert.match(harness.text("#statusPill"), /Question 3 of 5/);

  harness.submit("yes");
  harness.submit("no dependent, no digital assets");
  assert.match(harness.text("#statusPill"), /1040 ready/);
}

(async () => {
  await testSingleFlow();
  await testMarriedJointFlowWaitsForFifthAnswer();
  testBadW2Rejected();
  testDependentGuardrailRecovery();
  console.log("Harness smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
