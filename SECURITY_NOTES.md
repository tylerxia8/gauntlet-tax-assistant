# Security Notes

This is a static educational prototype, but it still treats every user-supplied W-2, chat reply, and upload as untrusted input.

## Red-Team Defenses

- User messages render with text nodes, not executable HTML.
- W-2 fields, chat replies, corrections, dependent answers, and addresses reject prompt-injection style instructions and script-like content.
- W-2 uploads are limited to small JSON/text files.
- The app enforces sequence guardrails: no tax answers or downloads can bypass the parsed fake W-2 and completed question flow.
- The page uses a restrictive Content Security Policy: local scripts/styles only, no object embedding, no form posting, no framing, and no cross-origin fetches.
- Downloads are generated locally in the browser and stamped as fake-data educational artifacts.

## Remaining Scope Boundary

The app does not process real tax records or real PII, does not e-file, and is not a production tax or identity system.
