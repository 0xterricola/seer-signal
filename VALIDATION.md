# Validation — audited revision 2

## Browser checks completed

- All six interfaces passed document-width checks at 320, 390, 768, and 1440 pixels: 24/24. Tables intentionally scroll inside their own keyboard-focusable regions.
- Desktop compositions were inspected; all six screenshot exports and the preview board were refreshed.
- Explorer: search, market filters, watchlisting, invalid-amount handling, and binary simulation were tested in the original pass.
- Categorical simulation: selecting Climate research produced a 33-cent quote and 303.03 shares for 100 demo USD; recording the position succeeded.
- Scalar simulation: DOWN at a 124/200 forecast produced a 38-cent quote and 263.16 shares; settlement at the same value returned an illustrative 100 demo USD payout.
- Conditional simulation: selecting the does-not-pass branch produced a 59-cent UP quote from 118/200 and 169.49 shares for 100 demo USD; recording succeeded.
- Independent selection: selecting Open Index / No produced a 76-cent quote. An amount of zero was rejected.
- Deep: an invalid score of 120 alongside a valid score blocked review and showed an error. Corrected scores survived a browser reload.
- Deep CSV: both text import and the native file-picker import were exercised. The file import merged g3/g4 values and produced four draft forecasts.
- Opportunity: shortlist/filter and selection-position simulation were tested; the revised review dialogs now include differentiated fictional problem, deliverable, and pilot briefs.
- Futarchy: proposal switching updated the conditional gap, and saving a branch produced a research note.
- Risk: two-protocol comparison showed the correct 6.9 percentage-point gap. The downloaded CSV was opened and verified: six rows, annual-PD units, liquidity, evaluation date, changes, and FICTIONAL_DEMO labels.
- Modal opening focused the Close dialog control. Escape handling for mobile navigation is implemented.
- Light theme rendering and persistence were checked in the first pass.
- Browser error/warning log was empty at the end of the tested revised explorer workflow.

## Source and delivery checks

- JavaScript passed node --check.
- HTML, CSS, and JavaScript were formatted for maintainability.
- Fonts are local compressed WOFF2 files with bundled license texts; the font assets plus licenses total approximately 68 KB.
- All six independent route entry documents and static asset references are included.
- Archive integrity is checked after packaging.

## Limits

This is a browser-local design prototype, not a production trading system. No real funds, wallet, execution service, agent API, oracle, or live market feed is connected. Simulation prices are fixed; fees, spread, and slippage are excluded. Conditional refunds and risk resolution definitions are explicitly illustrative.

Testing used the available embedded browser, including exact-width frames. A full Safari/Firefox/Chrome matrix, physical-device test, screen-reader audit, and formal WCAG certification have not been performed. Those results are not implied by the checks above.

The host deployment has not been performed at the user’s request. Verify public access and all six routes after deployment.
