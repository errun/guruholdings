# Immutable SEC regression samples

These information-table XMLs were fetched from SEC EDGAR, not generated fixtures.
They test a real reduction in Amazon share count while its portfolio weight rose.
Keep them separate from the live rolling-quarter dataset so new disclosures do
not invalidate a historical regression test.

- Q4 2025, Third Point, accession `0001040273-26-000001`:
  https://www.sec.gov/Archives/edgar/data/1040273/000104027326000001/
- Q1 2026, Third Point, accession `0001040273-26-000002`:
  https://www.sec.gov/Archives/edgar/data/1040273/000104027326000002/

Live source hashes and change calculations remain independently checked by
`scripts/data/verify-13f.mjs` for all 16 managers on each data update.
