# Notes for Claude Code

This repo is a clickable **reference prototype** for CSC318 Group 20. Teammates use it
to hand-draw the A2 paper prototype. Keep these constraints when changing it:

- **No build step, no dependencies.** Plain `index.html` + `styles.css` + `data.js` +
  `screens.js` + `app.js`. It must keep working by double-clicking `index.html`
  (opened from `file://`), so no `fetch()` of local files, no ES modules, no CDN.
- **All data is fictional** (`data.js`). Never add real professors, real lab names,
  or real UofT program deadlines. Deadlines in the roadmap are marked "sample".
- **Every screen has drawing notes** in `screens.js` (ID S1–S11, concepts A/B/C,
  design requirements DR1–DR5, what to draw). When adding, removing or renaming a
  screen or feature, update `screens.js`, the screen index in `app.js`
  (`screensIndex`), and the table in `README.md` in the same change.
- **Wireframe look on purpose**: greys, plain system font, one action colour. Keep
  screens simple enough to redraw with a pen.
- Escape anything user-typed with `esc()` before inserting it into HTML.
- State lives in `state` and is saved to `localStorage` (wrapped in try/catch).
  "Reset demo data" on the All screens page must keep working.

Concepts: A = resource integration platform, B = research roadmap (3 questions,
plan, fit card, tracker), C = informal low-stakes communication (chat requests,
candidate snapshot, lab Q&A, contact preferences, supervisor inbox).
Design requirements: DR1 find what's open, DR2 know what's required, DR3 feel ready
to reach out, DR4 ease the screening load, DR5 agree on time & style.

Before finishing a change: open every screen via the "All screens" page, click
through the four flows listed there, and check the browser console for errors.
