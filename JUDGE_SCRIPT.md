# Judge Script

Use the live app at `https://tylerxia8.github.io/gauntlet-tax-assistant/`.

## Happy Path

1. Click **Load fake W-2**.
2. Click **Parse W-2**.
3. Answer:
   - `single`
   - `yes`
   - `yes`
   - `no dependent, no digital assets`
4. Confirm the status changes to **1040 ready**.
5. Click **Download 1040** and verify a filled PDF downloads.
6. Click **Download return data** to inspect the computed audit packet.
7. Click **Export** in the observation trail to inspect the event log.

## Married Filing Jointly Variation

1. Reset and load the fake W-2 again.
2. Answer:
   - `married filing jointly`
   - `5000 wages, 250 withheld`
   - `yes`
   - `yes`
   - `no one can claim me, no digital assets`
3. Confirm the summary shows **Married filing jointly** and wages of **$45,250**.

## Guardrail Recovery

1. Reset and load the fake W-2 again.
2. Answer:
   - `single`
   - `yes`
   - `2 kids`
3. The assistant should reject dependent credits as out of scope.
4. Reply `yes`, then `no dependent, no digital assets`.
5. Confirm the return still completes within the question budget.

## Bad W-2 Guardrail

Paste a W-2 JSON object with `"taxYear": 2024` and click **Parse W-2**. The app should reject it and log `guardrail.w2.reject`.
