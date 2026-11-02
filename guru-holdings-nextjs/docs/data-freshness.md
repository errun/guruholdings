# 13F freshness and release measurement

Updated 2026-11-03. The production Git branch is `main`; the default branch and
scheduled workflow are `master`. Keep both refs aligned and update them atomically.

## Source evidence

The site previously served a 2026Q1 snapshot generated on June 24. The August
and September updates failed because a newly ranked stock lacked an editorial
profile. GitHub subsequently disabled the schedule for inactivity. Optional
editorial content must not block verified SEC filings. Historical calculation
fixtures are immutable and separate from the moving four-quarter window.

The refreshed source snapshot contains 2026Q2 filings for 14 of 16 managers.
Pershing Square (2026Q1) and Scion (2025Q3) retain the latest 13F-HR available
under their configured CIKs. This does not assert that they have no other filings
or current positions. Per-manager dates and SEC source links remain authoritative.

`generatedAt` means holdings content changed. It is preserved if the content
fingerprint is unchanged. `data-generated/freshness.json` records a separate
successful independent SEC verification, tied to that fingerprint, quarter,
manager count and source hashes. The UI must not infer success from a future
calendar date. Quarter-end holdings and market-cap quote times describe different
datasets. Filing dates are not trade execution dates.

## Update and verification

The daily workflow runs at 02:23 UTC and can also be dispatched manually on
`master`. Order: fetch SEC -> sync routes -> calculations and freshness tests ->
independently verify all current source hashes -> record check -> type/build/SEO
checks -> atomic fast-forward push to `master` and `main`. Any failure preserves
the deployed snapshot. No force pushes or credential artifacts are used.

`SEC_USER_AGENT` remains a protected repository secret; the public fallback is
the project name and site URL. Browser-facing resources contain no credentials.
GitHub Actions uses its scoped job token and the bot's noreply commit address.
Confirm the first dispatched run actually produces a Vercel production deployment;
a successful schedule alone does not prove the public domain updated.

## Outcome measurement

Retain the exact release commit, deployment, source coverage and timestamps.
The existing protected report gains bounded 14-day daily engagement and research
event aggregates, excluding `codex_` validation sources. It uses the existing
read-only grant, no identifiers or new client-side tracking.

Compare complete days in the GA4 property timezone, excluding release day. Track
foreground seconds per session, engaged-session share, pageviews per session,
research navigation, and returning sessions. Returning-session share is not a
seven-day cohort retention rate; event counts are not session conversion rates.
Check at +2, +4 and +7 days. Early checks establish collection and directional
signals; small samples or thresholded/truncated data cannot establish an uplift.
Traffic mix and measurement anomalies must be addressed before causal claims.

## Rollback

Previous production: commit `047be72366940c11de0bca238acd8c9650eeea7c`, deployment
`dpl_6uTuJjFHDZ1SBhKpF5AAScrcuiNb`. On a source or UI regression, pause the data
workflow and roll back to that deployment. Keep diagnostics and secrets private;
do not rewrite Git history or rotate unrelated credentials during this release.
