# Tax Notes

This project is an educational hackathon prototype, not tax advice, e-filing software, or a substitute for IRS instructions.

## Official Sources

- IRS Form 1040 PDF, tax year 2025: `https://www.irs.gov/pub/irs-pdf/f1040.pdf`
- IRS federal income tax rates and brackets: `https://www.irs.gov/filing/federal-income-tax-rates-and-brackets`
- IRS inflation-adjusted items by tax year: `https://www.irs.gov/newsroom/inflation-adjusted-tax-items-by-tax-year`

## Supported Tax Scope

- Tax year: 2025.
- Income: fake W-2 wages only.
- Filing statuses: single, married filing jointly, and head of household.
- Standard deduction only.
- Dependents: zero or one qualifying child dependent.
- Child tax credit: simplified $2,000 nonrefundable credit for the one-child path, capped at tax before credits.
- Digital assets: yes/no checkbox only.
- Output: a filled educational Form 1040 PDF and audit JSON.

## Explicit Assumptions

For the one-child dependent path, the prototype assumes the child:

- is under age 17 at the end of 2025,
- lived with the taxpayer all year,
- has a valid SSN,
- is eligible for the child tax credit,
- does not require any other dependent-credit limitation analysis.

The prototype does not prepare Schedule 8812. It writes the simplified child tax credit amount to the Form 1040 line used by this bounded scenario.

## Not Supported

- Real PII or real filings.
- E-filing.
- Itemized deductions.
- Self-employment, unemployment, interest, dividends, capital gains, retirement income, Social Security, HSA, education credits, EITC, premium tax credit, or additional child tax credit.
- Married filing separately, qualifying surviving spouse, or nonresident/dual-status cases.
- More than one dependent.
- State returns.

## Calculation Summary

The app computes:

1. Total W-2 wages.
2. Adjusted gross income as W-2 wages.
3. Standard deduction by filing status.
4. Taxable income as AGI minus standard deduction, floored at zero.
5. Tax using the 2025 progressive bracket table embedded in `src/app.js`.
6. Optional simplified child tax credit.
7. Refund or amount owed from withholding minus total tax.
