const TAX_YEAR = 2025;

const TAX_RULES = {
  standardDeduction: {
    single: 15750,
    married_joint: 31500,
    head_of_household: 23625,
  },
  brackets: {
    single: [
      [11925, 0.1],
      [48475, 0.12],
      [103350, 0.22],
      [197300, 0.24],
      [250525, 0.32],
      [626350, 0.35],
      [Infinity, 0.37],
    ],
    married_joint: [
      [23850, 0.1],
      [96950, 0.12],
      [206700, 0.22],
      [394600, 0.24],
      [501050, 0.32],
      [751600, 0.35],
      [Infinity, 0.37],
    ],
    head_of_household: [
      [17000, 0.1],
      [64850, 0.12],
      [103350, 0.22],
      [197300, 0.24],
      [250500, 0.32],
      [626350, 0.35],
      [Infinity, 0.37],
    ],
  },
  childTaxCredit: 2000,
};

const DEMO_W2 = {
  taxYear: 2025,
  employeeName: "Jordan Lee",
  employeeSsn: "123-45-6789",
  employeeAddress: "482 Maple Street, Dayton, OH 45402",
  employerName: "Brightline Supply Co.",
  employerEin: "31-1234567",
  employerAddress: "1100 Warehouse Ave, Dayton, OH 45404",
  wages: 40250,
  federalWithholding: 3450,
  socialSecurityWages: 40250,
  socialSecurityTax: 2495.5,
  medicareWages: 40250,
  medicareTax: 583.63,
};

const FORM_1040_URL = "./assets/f1040-2025.pdf";
const MAX_CHAT_CHARS = 700;
const MAX_W2_CHARS = 12000;
const MAX_UPLOAD_BYTES = 20000;

const HOSTILE_INSTRUCTION_PATTERNS = [
  /\b(ignore|disregard|forget|override|bypass|disable)\b.{0,80}\b(instruction|guardrail|rule|policy|system|developer|prompt|validation|safety)\b/i,
  /\b(system|developer|assistant)\s*:/i,
  /\b(prompt\s*injection|jailbreak|red\s*team|exfiltrate|secret|api\s*key|token)\b/i,
  /<\s*script\b/i,
  /\b(onerror|onload|javascript:|data:text\/html)\b/i,
];

const IRS_1040_FIELDS = {
  firstName: "topmostSubform[0].Page1[0].f1_14[0]",
  lastName: "topmostSubform[0].Page1[0].f1_15[0]",
  ssn: "topmostSubform[0].Page1[0].f1_16[0]",
  homeAddress: "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_20[0]",
  city: "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_22[0]",
  state: "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_23[0]",
  zip: "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_24[0]",
  statusSingle: "topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].c1_8[0]",
  statusMarriedJoint: "topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].c1_8[1]",
  statusHeadOfHousehold: "topmostSubform[0].Page1[0].c1_8[0]",
  digitalAssetsYes: "topmostSubform[0].Page1[0].c1_10[0]",
  digitalAssetsNo: "topmostSubform[0].Page1[0].c1_10[1]",
  dependentFirstName: "topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_31[0]",
  dependentLastName: "topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_32[0]",
  dependentSsn: "topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_33[0]",
  dependentRelationship: "topmostSubform[0].Page1[0].Table_Dependents[0].Row1[0].f1_34[0]",
  dependentChildTaxCredit: "topmostSubform[0].Page1[0].Table_Dependents[0].Row5[0].Dependent1[0].c1_12[0]",
  wages: "topmostSubform[0].Page1[0].f1_47[0]",
  totalIncome: "topmostSubform[0].Page1[0].f1_70[0]",
  agi: "topmostSubform[0].Page1[0].f1_72[0]",
  standardDeduction: "topmostSubform[0].Page1[0].f1_73[0]",
  taxableIncome: "topmostSubform[0].Page1[0].f1_75[0]",
  taxpayerClaimedAsDependent: "topmostSubform[0].Page2[0].c2_1[0]",
  tax: "topmostSubform[0].Page2[0].f2_01[0]",
  childTaxCredit: "topmostSubform[0].Page2[0].f2_03[0]",
  taxAfterCredits: "topmostSubform[0].Page2[0].f2_08[0]",
  w2Withholding: "topmostSubform[0].Page2[0].f2_17[0]",
  totalWithholding: "topmostSubform[0].Page2[0].f2_20[0]",
  totalPayments: "topmostSubform[0].Page2[0].f2_30[0]",
  refund: "topmostSubform[0].Page2[0].f2_31[0]",
  amountOwed: "topmostSubform[0].Page2[0].f2_35[0]",
  signatureDate: "topmostSubform[0].Page2[0].f2_38[0]",
};

const state = {
  phase: "need_w2",
  questionCount: 0,
  w2: null,
  answers: {
    filingStatus: null,
    spouseIncome: 0,
    spouseWithholding: 0,
    address: null,
    dependents: null,
    canBeClaimed: null,
    digitalAssets: null,
  },
  result: null,
  observations: [],
};

const els = {
  messages: document.querySelector("#messages"),
  form: document.querySelector("#chatForm"),
  input: document.querySelector("#chatInput"),
  status: document.querySelector("#statusPill"),
  loadDemoW2: document.querySelector("#loadDemoW2"),
  downloadDemoW2: document.querySelector("#downloadDemoW2"),
  downloadDemoW2Html: document.querySelector("#downloadDemoW2Html"),
  w2File: document.querySelector("#w2File"),
  reset: document.querySelector("#resetSession"),
  w2Text: document.querySelector("#w2Text"),
  parseW2: document.querySelector("#parseW2"),
  summary: document.querySelector("#summaryList"),
  worksheet: document.querySelector("#taxWorksheet"),
  readyNotice: document.querySelector("#readyNotice"),
  observations: document.querySelector("#observationList"),
  downloadTrail: document.querySelector("#downloadTrail"),
  download: document.querySelector("#downloadReturn"),
  downloadReturnData: document.querySelector("#downloadReturnData"),
  pillarChat: document.querySelector("#pillarChat"),
  pillarTools: document.querySelector("#pillarTools"),
  pillarGuardrails: document.querySelector("#pillarGuardrails"),
  pillarObservation: document.querySelector("#pillarObservation"),
};

function money(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function addMessage(role, text) {
  const node = document.createElement("article");
  node.className = `message ${role}`;
  const speaker = role === "user" ? "You" : role === "guardrail" ? "Guardrail" : "Assistant";
  const speakerNode = document.createElement("small");
  speakerNode.textContent = speaker;
  node.appendChild(speakerNode);
  node.appendChild(document.createTextNode(String(text)));
  els.messages.appendChild(node);
  els.messages.scrollTop = els.messages.scrollHeight;
}

function observe(type, detail) {
  const entry = {
    at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    type,
    detail,
  };
  state.observations.unshift(entry);
  renderObservations();
  renderPillars();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function renderObservations() {
  els.observations.innerHTML = state.observations
    .map((entry) => `<li><strong>${escapeHtml(entry.type)}</strong> ${escapeHtml(entry.detail)} <span>${entry.at}</span></li>`)
    .join("");
}

function renderPillars() {
  els.pillarChat.textContent = `${state.questionCount}/5 questions asked; phase: ${state.phase}`;
  const lastTool = state.observations.find((entry) => entry.type.startsWith("tool."));
  els.pillarTools.textContent = lastTool ? lastTool.detail : "Waiting for first tool call";
  const lastGuardrail = state.observations.find((entry) => entry.type.startsWith("guardrail."));
  els.pillarGuardrails.textContent = lastGuardrail ? lastGuardrail.detail : "2025 fake W-2 scope enforced";
  els.pillarObservation.textContent = `${state.observations.length} events captured`;
}

function renderSummary() {
  const rows = [];
  if (state.w2) {
    rows.push(["Wages", money(totalWages())]);
    rows.push(["Withholding", money(totalWithholding())]);
  }
  if (state.answers.filingStatus) {
    rows.push(["Filing status", labelStatus(state.answers.filingStatus)]);
  }
  if (Array.isArray(state.answers.dependents)) {
    rows.push(["Dependents", String(state.answers.dependents.length)]);
  }
  if (state.result) {
    rows.push(["Taxable income", money(state.result.taxableIncome)]);
    rows.push(["Tax", money(state.result.tax)]);
    rows.push([state.result.refund >= 0 ? "Refund" : "Amount owed", money(Math.abs(state.result.refund))]);
  }
  els.summary.innerHTML = rows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("");
  renderWorksheet();
  const ready = Boolean(state.result);
  els.readyNotice.hidden = !ready;
  els.readyNotice.textContent = ready ? "Ready to download: 1040 PDF and return data are available." : "";
  els.download.dataset.ready = String(ready);
  els.downloadReturnData.dataset.ready = String(ready);
  els.download.title = ready ? "Download the filled educational 2025 Form 1040 PDF" : "Complete the W-2 chat flow first";
  els.downloadReturnData.title = ready ? "Download the computed return data audit packet" : "Complete the W-2 chat flow first";
}

function renderWorksheet() {
  if (!state.result) {
    els.worksheet.innerHTML = "";
    return;
  }

  const bracketRows = state.result.taxBreakdown
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.label)}</td>
        <td>${money(row.amount)}</td>
        <td>${Math.round(row.rate * 100)}%</td>
        <td>${money(row.tax)}</td>
      </tr>
    `)
    .join("");

  els.worksheet.innerHTML = `
    <h3>Tax worksheet</h3>
    <table>
      <thead><tr><th>Band</th><th>Income</th><th>Rate</th><th>Tax</th></tr></thead>
      <tbody>${bracketRows}</tbody>
    </table>
  `;
}

function setStatus(text) {
  els.status.textContent = text;
}

function labelStatus(status) {
  return {
    single: "Single",
    married_joint: "Married filing jointly",
    head_of_household: "Head of household",
  }[status] || "Unknown";
}

function resetSession() {
  state.phase = "need_w2";
  state.questionCount = 0;
  state.w2 = null;
  state.answers = {
    filingStatus: null,
    spouseIncome: 0,
    spouseWithholding: 0,
    address: null,
    dependents: null,
    canBeClaimed: null,
    digitalAssets: null,
  };
  state.result = null;
  state.observations = [];
  els.messages.innerHTML = "";
  els.w2Text.value = "";
  setStatus("Waiting for W-2");
  renderSummary();
  renderObservations();
  renderPillars();
  observe("session.start", "Initialized stateful chat loop with a five-question cap.");
  addMessage(
    "agent",
    "Hi, I can help create an educational 2025 federal Form 1040 from a fake W-2. Load the sample W-2 or paste one on the right, and I'll keep us under five questions."
  );
}

function downloadTextFile(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadW2File(file) {
  if (!file) return;
  if (file.size > MAX_UPLOAD_BYTES) {
    observe("guardrail.file.reject", "Rejected W-2 upload over the size limit.");
    addMessage("guardrail", "That file is too large for this prototype. Please upload a small fake W-2 JSON/text file.");
    return;
  }
  if (!/\.(json|txt)$/i.test(file.name) && !/json|text/.test(file.type)) {
    observe("guardrail.file.reject", "Rejected W-2 upload with unsupported file type.");
    addMessage("guardrail", "Please upload a fake W-2 as a .json or .txt file.");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    els.w2Text.value = String(reader.result || "");
    observe("fixture.upload", `Loaded fake W-2 upload: ${file.name}.`);
  });
  reader.addEventListener("error", () => {
    observe("guardrail.file.reject", `Could not read uploaded file: ${file.name}.`);
    addMessage("guardrail", "I couldn't read that file. Please paste the W-2 text instead.");
  });
  reader.readAsText(file);
}

function buildFakeW2Html(w2) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Fake 2025 W-2 - ${escapeHtml(w2.employeeName)}</title>
<style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:32px;color:#111}
.w2{max-width:900px;margin:auto;background:#fff;border:2px solid #111;padding:18px}
.top{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:10px}
h1{margin:0;font-size:28px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-left:1px solid #111;border-top:1px solid #111;margin-top:16px}
.box{border-right:1px solid #111;border-bottom:1px solid #111;padding:9px;min-height:54px}.box strong{display:block;font-size:12px}.wide{grid-column:span 2}.note{font-size:12px;color:#555;margin-top:14px}
</style>
</head>
<body>
<section class="w2">
<div class="top"><div><h1>Form W-2</h1><strong>Wage and Tax Statement</strong></div><div><strong>${TAX_YEAR}</strong><br>FAKE TEST DATA</div></div>
<div class="grid">
<div class="box"><strong>a Employee SSN</strong>${escapeHtml(w2.employeeSsn)}</div>
<div class="box"><strong>b Employer EIN</strong>${escapeHtml(w2.employerEin)}</div>
<div class="box wide"><strong>c Employer name/address</strong>${escapeHtml(w2.employerName)}<br>${escapeHtml(w2.employerAddress)}</div>
<div class="box wide"><strong>e/f Employee name/address</strong>${escapeHtml(w2.employeeName)}<br>${escapeHtml(w2.employeeAddress)}</div>
<div class="box"><strong>1 Wages, tips, other compensation</strong>${money(w2.wages)}</div>
<div class="box"><strong>2 Federal income tax withheld</strong>${money(w2.federalWithholding)}</div>
<div class="box"><strong>3 Social security wages</strong>${money(w2.socialSecurityWages || w2.wages)}</div>
<div class="box"><strong>4 Social security tax withheld</strong>${money(w2.socialSecurityTax || 0)}</div>
<div class="box"><strong>5 Medicare wages and tips</strong>${money(w2.medicareWages || w2.wages)}</div>
<div class="box"><strong>6 Medicare tax withheld</strong>${money(w2.medicareTax || 0)}</div>
</div>
<p class="note">This is synthetic hackathon test data only. Do not use real PII.</p>
</section>
</body>
</html>`;
}

function buildReturnDataPacket() {
  return {
    generatedAt: new Date().toISOString(),
    scope: {
      taxYear: TAX_YEAR,
      prototype: true,
      realFiling: false,
      taxAdvice: false,
      supportedIncome: "single fake W-2, optional spouse W-2 wages for joint filing",
      dependentCredits: "0 or 1 qualifying child with simplified assumptions",
    },
    w2: state.w2,
    answers: state.answers,
    result: state.result,
    observations: [...state.observations].reverse(),
  };
}

function parseW2Text(text) {
  observe("tool.parseW2.start", "Reading user-supplied W-2 data.");
  assertInputSafe(text, "W-2 source", MAX_W2_CHARS);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
    const pairs = text.split(/\n|,/).map((line) => line.trim()).filter(Boolean);
    for (const pair of pairs) {
      const match = pair.match(/^([^:=]+)[:=]\s*(.+)$/);
      if (match) data[toCamel(match[1])] = match[2];
    }
  }

  const normalized = {
    taxYear: Number(data.taxYear || data.year),
    employeeName: String(data.employeeName || data.name || "").trim(),
    employeeSsn: String(data.employeeSsn || data.ssn || "").trim(),
    employeeAddress: String(data.employeeAddress || data.address || "").trim(),
    employerName: String(data.employerName || data.employer || "").trim(),
    employerEin: String(data.employerEin || data.ein || "").trim(),
    employerAddress: String(data.employerAddress || "").trim(),
    wages: cleanNumber(data.wages || data.w2Wages || data.box1),
    federalWithholding: cleanNumber(data.federalWithholding || data.box2 || data.withholding),
    socialSecurityWages: cleanNumber(data.socialSecurityWages || data.box3 || data.wages),
    socialSecurityTax: cleanNumber(data.socialSecurityTax || data.box4),
    medicareWages: cleanNumber(data.medicareWages || data.box5 || data.wages),
    medicareTax: cleanNumber(data.medicareTax || data.box6),
  };

  validateW2(normalized);
  observe("tool.parseW2.ok", `Accepted W-2 for ${normalized.employeeName}, wages ${money(normalized.wages)}.`);
  return normalized;
}

function toCamel(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function cleanNumber(value) {
  return Number(String(value || "0").replace(/[$,\s]/g, ""));
}

function validateW2(w2) {
  const errors = [];
  if (w2.taxYear !== TAX_YEAR) errors.push("W-2 must be for tax year 2025.");
  if (!w2.employeeName) errors.push("Employee name is required.");
  validatePlainField(w2.employeeName, "Employee name", errors);
  validatePlainField(w2.employeeAddress, "Employee address", errors);
  validatePlainField(w2.employerName, "Employer name", errors);
  validatePlainField(w2.employerAddress, "Employer address", errors);
  if (!/^\d{3}-\d{2}-\d{4}$/.test(w2.employeeSsn)) errors.push("Use a fake SSN in ###-##-#### format.");
  if (!w2.employerName) errors.push("Employer name is required.");
  if (w2.wages < 25000 || w2.wages > 60000) errors.push("This prototype is bounded to W-2 wages from $25,000 to $60,000.");
  if (w2.federalWithholding < 0 || w2.federalWithholding > w2.wages * 0.35) errors.push("Federal withholding looks outside the allowed range.");
  if (errors.length) {
    observe("guardrail.w2.reject", errors.join(" "));
    throw new Error(errors.join("\n"));
  }
}

function validatePlainField(value, label, errors) {
  if (!value) return;
  const text = String(value);
  if (text.length > 180) errors.push(`${label} is too long for this prototype.`);
  if (/[<>]/.test(text)) errors.push(`${label} contains markup characters that are not valid W-2 data.`);
  if (HOSTILE_INSTRUCTION_PATTERNS.some((pattern) => pattern.test(text))) {
    errors.push(`${label} contains instructions or markup that are not valid W-2 data.`);
  }
  if (/[\u0000-\u001f\u007f]/.test(text)) errors.push(`${label} contains unsupported control characters.`);
}

function assertInputSafe(text, label, maxChars = MAX_CHAT_CHARS) {
  const value = String(text || "");
  if (value.length > maxChars) {
    observe("guardrail.input.reject", `Rejected ${label} over the length limit.`);
    throw new Error(`${label} is too long for this prototype.`);
  }
  if (HOSTILE_INSTRUCTION_PATTERNS.some((pattern) => pattern.test(value))) {
    observe("guardrail.input.reject", `Rejected ${label} with hostile instruction or script-like content.`);
    throw new Error(`${label} contains instructions or script-like content that I will not treat as tax data.`);
  }
}

function ask(text, phase) {
  state.phase = phase;
  state.questionCount += 1;
  observe("chat.ask", `Question ${state.questionCount}/5: ${text}`);
  addMessage("agent", text);
}

function nextPrompt() {
  if (!state.w2) {
    setStatus("Waiting for W-2");
    return;
  }
  if (!state.answers.filingStatus) {
    setStatus("Question 1 of 5");
    ask(
      `I found ${state.w2.employeeName}'s W-2 with ${money(state.w2.wages)} in wages and ${money(state.w2.federalWithholding)} withheld. What filing status should I use: single, married filing jointly, or head of household?`,
      "ask_status"
    );
    return;
  }
  if (state.answers.filingStatus === "married_joint" && state.answers.spouseIncome === null) {
    setStatus(`Question ${state.questionCount + 1} of 5`);
    ask("For a joint return, what were the spouse's W-2 wages and federal withholding? A reply like `0 wages, 0 withheld` is fine.", "ask_spouse");
    return;
  }
  if (!state.answers.address) {
    setStatus(`Question ${state.questionCount + 1} of 5`);
    ask(`Should I use the W-2 address, "${state.w2.employeeAddress}", on the 1040? If not, send the address to use.`, "ask_address");
    return;
  }
  if (state.answers.dependents === null) {
    setStatus(`Question ${state.questionCount + 1} of 5`);
    ask("Dependents: reply `0` for none, or one child like `Maya Lee, 234-56-7890, daughter`. I assume any listed child is under 17, lived with the taxpayer all year, and qualifies for the child tax credit.", "ask_dependents");
    return;
  }
  if (state.answers.canBeClaimed === null || state.answers.digitalAssets === null) {
    setStatus(`Question ${state.questionCount + 1} of 5`);
    ask("Last check: can someone else claim this taxpayer as a dependent, and did they have digital asset activity in 2025? A reply like `no dependent, no digital assets` is perfect.", "ask_final_checks");
    return;
  }
  finishReturn();
}

function handleUserMessage(text) {
  const normalized = text.trim();
  if (!normalized) return;
  addMessage("user", normalized);
  observe("chat.user", `Received reply during ${state.phase}.`);

  try {
    assertInputSafe(normalized, "Chat reply");
    if (applyCorrection(normalized)) {
      if (state.result) {
        recomputeCompletedReturn();
      } else {
        nextPrompt();
      }
      renderSummary();
      return;
    }

    if (state.phase === "need_w2") {
      addMessage("guardrail", "Please load or paste a fake W-2 first. I need that source document before asking tax questions.");
      observe("guardrail.sequence", "Blocked chat answer before W-2 was parsed.");
      return;
    }
    if (state.phase === "ask_status") {
      const status = parseFilingStatus(normalized);
      state.answers.filingStatus = status;
      if (status !== "married_joint") {
        state.answers.spouseIncome = 0;
        state.answers.spouseWithholding = 0;
      } else {
        state.answers.spouseIncome = null;
      }
    } else if (state.phase === "ask_spouse") {
      const spouse = parseMoneyPair(normalized);
      state.answers.spouseIncome = spouse.wages;
      state.answers.spouseWithholding = spouse.withholding;
    } else if (state.phase === "ask_address") {
      state.answers.address = /^yes|use|w-?2|same/i.test(normalized) ? state.w2.employeeAddress : normalized;
    } else if (state.phase === "ask_dependents") {
      state.answers.dependents = parseDependents(normalized);
    } else if (state.phase === "ask_final_checks") {
      const checks = parseFinalChecks(normalized);
      state.answers.canBeClaimed = checks.canBeClaimed;
      state.answers.digitalAssets = checks.digitalAssets;
    }
    nextPrompt();
  } catch (error) {
    observe("guardrail.answer.reject", error.message);
    addMessage("guardrail", `${error.message}\nCould you send that again in the simple format I asked for?`);
  }
  renderSummary();
}

function applyCorrection(text) {
  if (!/^(change|update|correct|set)\b/i.test(text)) return false;
  assertInputSafe(text, "Correction");
  if (!state.w2) throw new Error("Please load or paste a fake W-2 before correcting return answers.");

  const value = text.replace(/^(change|update|correct|set)\s+/i, "").trim();
  if (/^(filing\s+status|status)\b/i.test(value)) {
    const statusText = value.replace(/^(filing\s+status|status)\s*(to)?\s*/i, "");
    const status = parseFilingStatus(statusText);
    state.answers.filingStatus = status;
    if (status === "married_joint") {
      state.answers.spouseIncome = state.answers.spouseIncome || null;
    } else {
      state.answers.spouseIncome = 0;
      state.answers.spouseWithholding = 0;
    }
    observe("correction.apply", `Changed filing status to ${labelStatus(status)}.`);
    addMessage("agent", `Got it. I changed the filing status to ${labelStatus(status)}.`);
    return true;
  }

  if (/^address\b/i.test(value)) {
    const address = value.replace(/^address\s*(to)?\s*/i, "").trim();
    if (!address) throw new Error("Please include the address to use.");
    assertInputSafe(address, "Address correction", 220);
    state.answers.address = address;
    observe("correction.apply", "Changed taxpayer address.");
    addMessage("agent", "Got it. I updated the address.");
    return true;
  }

  if (/^dependents?\b/i.test(value)) {
    const dependentText = value.replace(/^dependents?\s*(to)?\s*/i, "").trim();
    state.answers.dependents = parseDependents(dependentText);
    observe("correction.apply", `Changed dependents to ${state.answers.dependents.length}.`);
    addMessage("agent", `Got it. I updated dependents to ${state.answers.dependents.length}.`);
    return true;
  }

  if (/^spouse\b/i.test(value)) {
    if (state.answers.filingStatus !== "married_joint") {
      throw new Error("Spouse wages only apply to married filing jointly in this prototype.");
    }
    const spouse = parseMoneyPair(value);
    state.answers.spouseIncome = spouse.wages;
    state.answers.spouseWithholding = spouse.withholding;
    observe("correction.apply", "Changed spouse W-2 wages and withholding.");
    addMessage("agent", "Got it. I updated the spouse W-2 amounts.");
    return true;
  }

  if (/digital|crypto|virtual|asset/i.test(value)) {
    if (!/\b(yes|no|y|n)\b/i.test(value)) throw new Error("Please set digital assets to yes or no.");
    state.answers.digitalAssets = /\b(yes|y)\b/i.test(value);
    observe("correction.apply", `Changed digital assets to ${state.answers.digitalAssets ? "yes" : "no"}.`);
    addMessage("agent", `Got it. I updated digital assets to ${state.answers.digitalAssets ? "yes" : "no"}.`);
    return true;
  }

  if (/claim|dependent\s+status/i.test(value)) {
    if (!/\b(yes|no|y|n)\b/i.test(value)) throw new Error("Please set dependent-claim status to yes or no.");
    state.answers.canBeClaimed = /\b(yes|y)\b/i.test(value);
    observe("correction.apply", `Changed dependent-claim status to ${state.answers.canBeClaimed ? "yes" : "no"}.`);
    addMessage("agent", `Got it. I updated whether someone can claim the taxpayer to ${state.answers.canBeClaimed ? "yes" : "no"}.`);
    return true;
  }

  throw new Error("I can correct filing status, spouse wages, address, dependents, claim status, or digital assets.");
}

function parseFilingStatus(text) {
  const value = text.toLowerCase();
  if (value.includes("married") || value.includes("joint")) return "married_joint";
  if (value.includes("head")) return "head_of_household";
  if (value.includes("single")) return "single";
  throw new Error("Please choose one of: single, married filing jointly, or head of household.");
}

function parseMoneyPair(text) {
  const numbers = [...text.matchAll(/\$?\d[\d,]*(?:\.\d{1,2})?/g)].map((match) => cleanNumber(match[0]));
  if (!numbers.length) throw new Error("Please include spouse wages and withholding, even if both are 0.");
  const wages = numbers[0] || 0;
  const withholding = numbers[1] || 0;
  if (wages < 0 || wages > 60000) throw new Error("Spouse wages must be between $0 and $60,000 for this prototype.");
  if (withholding < 0 || withholding > wages * 0.35) throw new Error("Spouse withholding looks outside the allowed range.");
  return { wages, withholding };
}

function parseFinalChecks(text) {
  const value = text.toLowerCase();
  const dependentMention = value.match(/(dependent|claim)/);
  const digitalMention = value.match(/(digital|crypto|virtual|asset)/);
  if (!dependentMention || !digitalMention) {
    throw new Error("Please answer both parts, for example: `no dependent, no digital assets`.");
  }

  const canBeClaimed = !/(no\s+one\s+can\s+claim|no|not|cannot|can't)\s+(me\s+)?(as\s+a\s+)?(dependent|claim)|no\s+dependent/.test(value);
  const digitalAssets = !/(no|none|not|without)\s+(digital|crypto|virtual|asset)/.test(value);
  return { canBeClaimed, digitalAssets };
}

function parseDependents(text) {
  const value = text.trim();
  assertInputSafe(value, "Dependent answer");
  if (/^(yes|y|0|none|no|no dependents)\b/i.test(value)) return [];
  if (/\b(two|three|four|[2-9])\b/i.test(value)) {
    throw new Error("This prototype supports at most one qualifying child dependent.");
  }

  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  const ssn = value.match(/\b\d{3}-\d{2}-\d{4}\b/)?.[0] || "";
  if (parts.length < 3 || !ssn) {
    throw new Error("For one child dependent, use: `First Last, 234-56-7890, relationship`.");
  }

  const name = splitName(parts[0]);
  const relationship = parts.find((part) => !part.includes(ssn) && part !== parts[0]) || parts[2];
  if (!name.first || !name.last) throw new Error("Please include the dependent's first and last name.");
  return [{
    firstName: name.first,
    lastName: name.last,
    ssn,
    relationship,
    qualifyingChild: true,
    assumptions: "Under 17, lived with taxpayer all year, valid SSN, taxpayer may claim child tax credit.",
  }];
}

function totalWages() {
  return state.w2.wages + Number(state.answers.spouseIncome || 0);
}

function totalWithholding() {
  return state.w2.federalWithholding + Number(state.answers.spouseWithholding || 0);
}

function computeTax(status, taxableIncome) {
  const brackets = TAX_RULES.brackets[status];
  let remaining = taxableIncome;
  let previousLimit = 0;
  let tax = 0;
  const breakdown = [];
  for (const [limit, rate] of brackets) {
    const span = Math.min(remaining, limit - previousLimit);
    if (span <= 0) break;
    const rowTax = span * rate;
    tax += rowTax;
    breakdown.push({
      label: limit === Infinity ? `Over ${money(previousLimit)}` : `${money(previousLimit + 1)} to ${money(limit)}`,
      amount: span,
      rate,
      tax: Math.round(rowTax),
    });
    remaining -= span;
    previousLimit = limit;
  }
  return { tax: Math.round(tax), breakdown };
}

function computeReturnResult() {
  const status = state.answers.filingStatus || "single";
  const wages = totalWages();
  const deduction = TAX_RULES.standardDeduction[status];
  const taxableIncome = Math.max(0, wages - deduction);
  const computedTax = computeTax(status, taxableIncome);
  const taxBeforeCredits = computedTax.tax;
  const dependentCount = Array.isArray(state.answers.dependents) ? state.answers.dependents.length : 0;
  const childCredit = Math.min(taxBeforeCredits, dependentCount * TAX_RULES.childTaxCredit);
  const tax = Math.max(0, taxBeforeCredits - childCredit);
  const withholding = totalWithholding();
  return {
    status,
    wages,
    agi: wages,
    deduction,
    taxableIncome,
    taxBeforeCredits,
    taxBreakdown: computedTax.breakdown,
    childCredit,
    tax,
    withholding,
    refund: withholding - tax,
    generatedAt: new Date().toISOString(),
  };
}

function finishReturn() {
  observe("tool.computeTax.start", "Computing AGI, deduction, taxable income, tax, credits, and refund.");
  state.result = computeReturnResult();
  state.phase = "complete";
  setStatus("1040 ready");
  observe("tool.fill1040.ok", `Generated downloadable 1040-style return with ${state.result.refund >= 0 ? "refund" : "amount owed"} ${money(Math.abs(state.result.refund))}.`);
  addMessage(
    "agent",
    `Done. I prepared the educational 2025 Form 1040 PDF for ${state.w2.employeeName}. Based on the simple W-2 scenario, the ${state.result.refund >= 0 ? "estimated refund is" : "estimated amount owed is"} ${money(Math.abs(state.result.refund))}.\n\nUse the Download 1040 button on the right. This is for hackathon/testing only, not tax advice and not a real filing.`
  );
  renderSummary();
}

function recomputeCompletedReturn() {
  observe("tool.computeTax.start", "Recomputing return after user correction.");
  state.result = computeReturnResult();
  state.phase = "complete";
  setStatus("1040 ready");
  observe("tool.fill1040.update", `Updated return with ${state.result.refund >= 0 ? "refund" : "amount owed"} ${money(Math.abs(state.result.refund))}.`);
  addMessage(
    "agent",
    `Updated. I recalculated the return, and the ${state.result.refund >= 0 ? "estimated refund is" : "estimated amount owed is"} now ${money(Math.abs(state.result.refund))}.`
  );
}

function buildReturnHtml() {
  const r = state.result;
  const address = state.answers.address || state.w2.employeeAddress;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>2025 Form 1040 - ${escapeHtml(state.w2.employeeName)}</title>
<style>
body{font-family:Arial,sans-serif;color:#111;margin:32px;line-height:1.35}
.form{max-width:900px;margin:auto;border:2px solid #111;padding:18px}
h1{font-size:28px;margin:0}.sub{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #333;padding:7px;text-align:left}th{background:#eee}
.note{margin-top:18px;font-size:12px;color:#444}.checkbox{display:inline-block;width:13px;height:13px;border:1px solid #111;margin-right:6px;vertical-align:-2px}.checked{background:#111}
</style>
</head>
<body>
<section class="form">
<div class="sub"><div><h1>Form 1040</h1><strong>U.S. Individual Income Tax Return</strong></div><div><strong>2025</strong><br>Educational prototype</div></div>
<p><strong>Name:</strong> ${escapeHtml(state.w2.employeeName)}<br><strong>SSN:</strong> ${escapeHtml(state.w2.employeeSsn)}<br><strong>Address:</strong> ${escapeHtml(address)}</p>
<p><strong>Filing status:</strong>
${statusBox("single", r.status)} Single
${statusBox("married_joint", r.status)} Married filing jointly
${statusBox("head_of_household", r.status)} Head of household
</p>
<table>
<tr><th>1040 line</th><th>Description</th><th>Amount</th></tr>
<tr><td>1a</td><td>Total wages from Form W-2</td><td>${money(r.wages)}</td></tr>
<tr><td>11</td><td>Adjusted gross income</td><td>${money(r.agi)}</td></tr>
<tr><td>12</td><td>Standard deduction</td><td>${money(r.deduction)}</td></tr>
<tr><td>15</td><td>Taxable income</td><td>${money(r.taxableIncome)}</td></tr>
<tr><td>16</td><td>Tax before credits</td><td>${money(r.taxBeforeCredits)}</td></tr>
<tr><td>19</td><td>Child tax credit / credit for other dependents</td><td>${money(r.childCredit)}</td></tr>
<tr><td>24</td><td>Total tax</td><td>${money(r.tax)}</td></tr>
<tr><td>25a</td><td>Federal income tax withheld from W-2s</td><td>${money(r.withholding)}</td></tr>
<tr><td>${r.refund >= 0 ? "34" : "37"}</td><td>${r.refund >= 0 ? "Amount overpaid / refund" : "Amount you owe"}</td><td>${money(Math.abs(r.refund))}</td></tr>
</table>
<h2>W-2 source</h2>
<table>
<tr><td>Employer</td><td>${escapeHtml(state.w2.employerName)}</td></tr>
<tr><td>EIN</td><td>${escapeHtml(state.w2.employerEin)}</td></tr>
<tr><td>Box 1 wages</td><td>${money(state.w2.wages)}</td></tr>
<tr><td>Box 2 federal withholding</td><td>${money(state.w2.federalWithholding)}</td></tr>
</table>
<p class="note">Generated ${escapeHtml(new Date(r.generatedAt).toLocaleString())}. This file is a hackathon educational artifact, not official IRS software, tax advice, e-filing, or a substitute for IRS forms/instructions.</p>
</section>
</body>
</html>`;
}

function statusBox(status, selected) {
  return `<span class="checkbox ${status === selected ? "checked" : ""}"></span>`;
}

async function buildReturnPdfBytes() {
  if (!window.PDFLib) {
    throw new Error("PDF library did not load.");
  }

  observe("tool.fillPdf.start", "Loading official IRS 2025 Form 1040 PDF template.");
  const response = await fetch(FORM_1040_URL);
  if (!response.ok) {
    throw new Error("Could not load the IRS 1040 PDF template.");
  }

  const pdfDoc = await window.PDFLib.PDFDocument.load(await response.arrayBuffer());
  pdfDoc.setTitle(`Educational 2025 Form 1040 - ${state.w2.employeeName}`);
  pdfDoc.setSubject("Hackathon prototype. Not tax advice, not e-filed, not signed.");
  pdfDoc.setCreator("Gauntlet Tax-Filing Assistant Prototype");
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
  const r = state.result;
  const name = splitName(state.w2.employeeName);
  const address = parseAddress(state.answers.address || state.w2.employeeAddress);

  setPdfText(form, IRS_1040_FIELDS.firstName, name.first);
  setPdfText(form, IRS_1040_FIELDS.lastName, name.last);
  setPdfText(form, IRS_1040_FIELDS.ssn, state.w2.employeeSsn.replace(/\D/g, ""));
  setPdfText(form, IRS_1040_FIELDS.homeAddress, address.street);
  setPdfText(form, IRS_1040_FIELDS.city, address.city);
  setPdfText(form, IRS_1040_FIELDS.state, address.state);
  setPdfText(form, IRS_1040_FIELDS.zip, address.zip);

  checkPdfBox(form, IRS_1040_FIELDS.statusSingle, r.status === "single");
  checkPdfBox(form, IRS_1040_FIELDS.statusMarriedJoint, r.status === "married_joint");
  checkPdfBox(form, IRS_1040_FIELDS.statusHeadOfHousehold, r.status === "head_of_household");
  checkPdfBox(form, IRS_1040_FIELDS.digitalAssetsYes, state.answers.digitalAssets === true);
  checkPdfBox(form, IRS_1040_FIELDS.digitalAssetsNo, state.answers.digitalAssets === false);
  checkPdfBox(form, IRS_1040_FIELDS.taxpayerClaimedAsDependent, state.answers.canBeClaimed === true);
  fillDependentFields(form, state.answers.dependents[0]);

  setPdfMoney(form, IRS_1040_FIELDS.wages, r.wages);
  setPdfMoney(form, IRS_1040_FIELDS.totalIncome, r.wages);
  setPdfMoney(form, IRS_1040_FIELDS.agi, r.agi);
  setPdfMoney(form, IRS_1040_FIELDS.standardDeduction, r.deduction);
  setPdfMoney(form, IRS_1040_FIELDS.taxableIncome, r.taxableIncome);
  setPdfMoney(form, IRS_1040_FIELDS.tax, r.taxBeforeCredits);
  setPdfMoney(form, IRS_1040_FIELDS.childTaxCredit, r.childCredit);
  setPdfMoney(form, IRS_1040_FIELDS.taxAfterCredits, r.tax);
  setPdfMoney(form, IRS_1040_FIELDS.w2Withholding, r.withholding);
  setPdfMoney(form, IRS_1040_FIELDS.totalWithholding, r.withholding);
  setPdfMoney(form, IRS_1040_FIELDS.totalPayments, r.withholding);
  setPdfMoney(form, IRS_1040_FIELDS.refund, Math.max(0, r.refund));
  setPdfMoney(form, IRS_1040_FIELDS.amountOwed, Math.max(0, -r.refund));
  setPdfText(form, IRS_1040_FIELDS.signatureDate, new Date().toLocaleDateString("en-US"));

  form.updateFieldAppearances(font);
  form.flatten();
  stampPdfDisclaimer(pdfDoc, font);
  observe("tool.fillPdf.ok", "Populated and flattened official IRS 2025 Form 1040 fields.");
  return pdfDoc.save();
}

function stampPdfDisclaimer(pdfDoc, font) {
  const color = window.PDFLib.rgb(0.58, 0.12, 0.12);
  for (const page of pdfDoc.getPages()) {
    page.drawText("EDUCATIONAL PROTOTYPE - FAKE DATA ONLY - NOT FOR FILING", {
      x: 42,
      y: 16,
      size: 8,
      font,
      color,
    });
  }
}

function fillDependentFields(form, dependent) {
  if (!dependent) return;
  setPdfText(form, IRS_1040_FIELDS.dependentFirstName, dependent.firstName);
  setPdfText(form, IRS_1040_FIELDS.dependentLastName, dependent.lastName);
  setPdfText(form, IRS_1040_FIELDS.dependentSsn, dependent.ssn.replace(/\D/g, ""));
  setPdfText(form, IRS_1040_FIELDS.dependentRelationship, dependent.relationship);
  checkPdfBox(form, IRS_1040_FIELDS.dependentChildTaxCredit, true);
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return {
    first: parts.slice(0, -1).join(" ") || parts[0] || "",
    last: parts.length > 1 ? parts[parts.length - 1] : "",
  };
}

function parseAddress(value) {
  assertInputSafe(value, "Address", 220);
  const match = String(value).match(/^(.+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
  if (!match) {
    return { street: value, city: "", state: "", zip: "" };
  }
  return {
    street: match[1],
    city: match[2],
    state: match[3].toUpperCase(),
    zip: match[4],
  };
}

function setPdfText(form, fieldName, value) {
  try {
    form.getTextField(fieldName).setText(String(value ?? ""));
  } catch (error) {
    observe("tool.fillPdf.field_skip", `Skipped missing text field ${fieldName}.`);
  }
}

function setPdfMoney(form, fieldName, value) {
  setPdfText(form, fieldName, Math.round(Number(value || 0)).toString());
}

function checkPdfBox(form, fieldName, checked) {
  try {
    const box = form.getCheckBox(fieldName);
    if (checked) box.check();
    else box.uncheck();
  } catch (error) {
    observe("tool.fillPdf.field_skip", `Skipped missing checkbox ${fieldName}.`);
  }
}

async function downloadReturn() {
  if (!state.result) {
    promptForMissingReturn("1040 PDF");
    return;
  }
  let blob;
  let extension = "pdf";
  try {
    const pdfBytes = await buildReturnPdfBytes();
    blob = new Blob([pdfBytes], { type: "application/pdf" });
    observe("tool.download1040", "Created local downloadable filled 2025 Form 1040 PDF.");
  } catch (error) {
    observe("tool.download1040.fallback", `${error.message} Created HTML fallback return instead.`);
    blob = new Blob([buildReturnHtml()], { type: "text/html" });
    extension = "html";
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `2025-1040-${state.w2.employeeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function promptForMissingReturn(label) {
  observe("guardrail.download.block", `Blocked ${label} download before the return was ready.`);
  addMessage("guardrail", `I need to finish the return before I can download the ${label}. Load or paste a fake W-2, click Parse W-2, then answer the remaining chat questions.`);
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.input.value;
  els.input.value = "";
  handleUserMessage(text);
});

els.loadDemoW2.addEventListener("click", () => {
  els.w2Text.value = JSON.stringify(DEMO_W2, null, 2);
  observe("fixture.load", "Loaded fake W-2 test fixture into the input area.");
});

els.downloadDemoW2.addEventListener("click", () => {
  observe("fixture.download", "Downloaded fake W-2 JSON fixture.");
  downloadTextFile("fake-2025-w2-jordan-lee.json", JSON.stringify(DEMO_W2, null, 2));
});

els.downloadDemoW2Html.addEventListener("click", () => {
  observe("fixture.downloadHtml", "Downloaded visual fake W-2 preview.");
  downloadTextFile("fake-2025-w2-jordan-lee.html", buildFakeW2Html(DEMO_W2), "text/html");
});

els.w2File.addEventListener("change", () => {
  loadW2File(els.w2File.files?.[0]);
});

els.parseW2.addEventListener("click", () => {
  try {
    state.w2 = parseW2Text(els.w2Text.value);
    state.phase = "ready_for_questions";
    addMessage("agent", "Thanks, I've got the W-2. I'll ask only what's needed to finish the simple federal return.");
    nextPrompt();
    renderSummary();
  } catch (error) {
    addMessage("guardrail", error.message);
  }
});

els.reset.addEventListener("click", resetSession);
els.downloadTrail.addEventListener("click", () => {
  observe("observation.export", "Exported observation trail as JSON.");
  downloadTextFile("tax-assistant-observation-trail.json", JSON.stringify([...state.observations].reverse(), null, 2));
});
els.downloadReturnData.addEventListener("click", () => {
  if (!state.result) {
    promptForMissingReturn("return data");
    return;
  }
  observe("tool.downloadReturnData", "Downloaded computed return data audit packet.");
  const slug = state.w2.employeeName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  downloadTextFile(`2025-1040-${slug}-return-data.json`, JSON.stringify(buildReturnDataPacket(), null, 2));
});
els.download.addEventListener("click", downloadReturn);

resetSession();
