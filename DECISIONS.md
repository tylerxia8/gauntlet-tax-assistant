# Decisions

## Architecture

This prototype is a static browser app with a deterministic agent harness instead of an LLM. That makes the four required pillars easy to inspect: the state machine carries chat state across turns, named JavaScript tools parse the W-2 and generate the return, guardrails reject out-of-scope inputs, and the observation trail exposes every significant decision.

The running app also surfaces those pillars directly above the chat. Judges can export the observation trail and fake W-2 fixture from the UI, so the harness is visible without opening developer tools.

The tax calculation exposes a bracket-by-bracket worksheet in the UI and in the return-data JSON. That keeps the computation auditable while staying within the deliberately narrow W-2-only scope.

## Tax Scope

The calculation is intentionally bounded to a fake 2025 W-2 taxpayer earning roughly $40,000. It supports single, married filing jointly, and head of household; optional spouse W-2 wages for a joint return; no dependent credits; and the standard deduction. It does not itemize, handle self-employment, e-file, process real PII, or claim to be tax advice.

## Conversation

The assistant asks at most five questions: filing status, spouse wages if needed, address confirmation, no-dependent confirmation, and final checks for dependent-claim status plus digital asset activity. The fake W-2 supplies the rest. This keeps the user experience warm and short while still letting the return change based on key inputs.

## Output

The app produces a downloadable PDF by loading the official IRS 2025 Form 1040 fillable PDF and populating the fields needed for this simple W-2 path with `pdf-lib`. If PDF generation fails in an unusual browser environment, the tool falls back to an HTML return so the end-to-end harness still completes.

## Deployment

Because the app is static, it can be deployed to Render Static Sites, Netlify, GitHub Pages, or any comparable free host. The repository root is the publish directory and no build command is required.
