# Gauntlet Hackathon Tax Assistant

A small static web app for the Gauntlet hackathon challenge: a web-based chat that turns a fake 2025 W-2 into a downloadable educational 2025 IRS Form 1040 PDF.

## Live Demo

- App: `https://tylerxia8.github.io/gauntlet-tax-assistant/`
- Source: `https://github.com/tylerxia8/gauntlet-tax-assistant`

## Local Run

Serve the folder:

```sh
npm install
npm start
```

Then open `http://localhost:4173`. No backend API key is required. The local server is needed so the browser can fetch the bundled IRS PDF template.

## Test Flow

1. Click **Load fake W-2**.
2. Click **Parse W-2**.
3. Answer the chat questions, for example:
   - `single`
   - `yes`
   - `yes`
   - `no dependent, no digital assets`
4. Click **Download 1040**.

The right panel shows the harness observation trail: chat events, tool calls, guardrail decisions, and the final form-generation action.

## Deployment

This can be deployed as a static site. On Render, create a **Static Site** with:

- Build command: `npm install`
- Publish directory: `.`

The app uses `vendor/pdf-lib.min.js` and `assets/f1040-2025.pdf` at runtime, so no server process is required.

## Scope

This is an educational hackathon prototype only. It uses fake W-2 data, performs a bounded 2025 federal W-2-only calculation with no dependent credits, and does not provide tax advice, e-file, or handle real PII. The PDF template is the IRS Form 1040 downloaded from `https://www.irs.gov/pub/irs-pdf/f1040.pdf`.
