const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PDFDocument, StandardFonts } = require("pdf-lib");

const templatePath = path.resolve(__dirname, "..", "assets", "f1040-2025.pdf");

const fields = {
  firstName: "topmostSubform[0].Page1[0].f1_14[0]",
  lastName: "topmostSubform[0].Page1[0].f1_15[0]",
  ssn: "topmostSubform[0].Page1[0].f1_16[0]",
  statusSingle: "topmostSubform[0].Page1[0].Checkbox_ReadOrder[0].c1_8[0]",
  wages: "topmostSubform[0].Page1[0].f1_47[0]",
  agi: "topmostSubform[0].Page1[0].f1_72[0]",
  taxableIncome: "topmostSubform[0].Page1[0].f1_75[0]",
  tax: "topmostSubform[0].Page2[0].f2_01[0]",
  withholding: "topmostSubform[0].Page2[0].f2_17[0]",
  refund: "topmostSubform[0].Page2[0].f2_31[0]",
};

(async () => {
  assert.ok(fs.existsSync(templatePath), "IRS 1040 PDF template is missing");

  const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  form.getTextField(fields.firstName).setText("Jordan");
  form.getTextField(fields.lastName).setText("Lee");
  form.getTextField(fields.ssn).setText("123456789");
  form.getCheckBox(fields.statusSingle).check();
  form.getTextField(fields.wages).setText("40250");
  form.getTextField(fields.agi).setText("40250");
  form.getTextField(fields.taxableIncome).setText("24500");
  form.getTextField(fields.tax).setText("2678");
  form.getTextField(fields.withholding).setText("3450");
  form.getTextField(fields.refund).setText("772");

  form.updateFieldAppearances(font);
  form.flatten();

  const bytes = await pdfDoc.save();
  assert.ok(bytes.length > 100000, "filled PDF should be non-trivial");

  console.log("PDF field map test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
