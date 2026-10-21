# Seer / Signal

Six interactive interfaces for Seer’s Electric Foundation design bounty.
Created for @0xterricola. All market data is fictional and all transactions are simulated.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 4173 --directory site
```

Open http://localhost:4173/ in a browser. Use HTTP rather than opening the HTML files directly.

## Deploy

Upload the contents of `site/` to any static web host. No build step, package installation, environment variables, database, or backend is required. The publish directory is `site`.

Keep the folder structure intact. Every route has its own index.html, so no single-page-app rewrite rule is needed. Relative asset paths also support deployment under a subdirectory.

After deployment, replace YOUR_PUBLIC_BASE_URL below with your actual public origin (including any deployment subdirectory):

1. Seer homepage — YOUR_PUBLIC_BASE_URL/
2. Seer app — YOUR_PUBLIC_BASE_URL/explorer/
3. Deep — YOUR_PUBLIC_BASE_URL/deep/
4. Futarchy — YOUR_PUBLIC_BASE_URL/futarchy/
5. Opportunity Markets — YOUR_PUBLIC_BASE_URL/opportunity/
6. Risk Pricing — YOUR_PUBLIC_BASE_URL/risk/

Design rationale is available at /design/. The six-screen overview is /preview-board.html; this is a fixed-width presentation board, not a responsive product screen.

Test all six deployed links in a signed-out/private browser before submitting. The bounty requires public hosted demos; this source package is not itself a submission.

## Included

- site/: deployable HTML, CSS, and JavaScript source
- screenshots/: six desktop viewport images
- DESIGN-RATIONALE.md: design intent, EF departures, and interaction walkthrough
- VALIDATION.md: checks performed and prototype boundaries
- JUDGES-WALKTHROUGH.md: a concise tour and repository guidance
- preview-light.png: alternate light-theme overview
- FINAL-AUDIT.md: substantive review findings, fixes, and remaining limits
- ../seer-signal-preview.png: six-interface preview image, also included as preview.png in this package

## Edit

- site/assets/style.css: shared tokens, dark/light themes, layouts, and responsive styles
- site/assets/app.js: route rendering, fictional fixture data, interactions, and local persistence
- site/index.html and the route folders: static entry documents

The application derives its base path from its script URL. If you rename route folders, update `routes` and the route renderer in app.js.

## Runtime and dependencies

The site uses native browser APIs (including dialog, localStorage, and Blob downloads). It targets current desktop and mobile browsers. DM Sans and Space Grotesk are bundled locally as compressed WOFF2 files, with their SIL Open Font License texts in assets/fonts/. System fonts remain as fallbacks. The interface makes no external font requests. There are no analytics, wallet requests, paid services, or API keys.

Watchlists, shortlists, and simulated activity are stored only in the current browser. Reset them from Design notes → Reset saved demo activity. Valid draft Deep forecasts are saved locally and restored after navigation or reload. Invalid scores block batch review and are not persisted.

This package contains no live exchange integration or real settlement implementation. The conditional settlement example and risk framework are explicitly identified as proposed demo rules.
