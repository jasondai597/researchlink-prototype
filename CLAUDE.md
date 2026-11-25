# Notes for working on this repo

ResearchLink: intake form → matching → recommended research programs/projects →
action plan with deadlines. Vite + React + TypeScript, no backend.

## Commands

- `npm run dev`, `npm test` (Vitest), `npm run build` (runs `tsc -b`), `npm run lint` (oxlint)
- Run `npm test` and `npm run build` before every commit.

## Rules

- **Commits:** no AI attribution. Do not add `Co-Authored-By` or any assistant or
  session lines to commit messages or PR descriptions.
- **Data:** `src/data/opportunities.ts` is sample data, labelled "(sample)". Don't
  present invented programs, labs, people or deadlines as real. Real entries need a
  `url` and a `lastVerified` date from the official source.
- **Privacy:** answers stay in localStorage. Don't send profile data anywhere. GPA and
  eligibility are optional and are used only to filter.
- **Matching:** keep `src/lib/match.ts` explainable. Every score change should
  produce a reason or a gap the student can read. Show bands, not percentages.
  When you change weights or rules, update the tests and the README.
- **Plan:** step offsets live in `STEPS` in `src/lib/plan.ts`; shared documents (CV,
  transcript, reference) are merged across applications. Informal outreach timing is
  `OUTREACH_DAYS` / `OUTREACH_ROLLING_DAYS`; drafts live in `src/lib/outreach.ts`.
- **Freshness:** `STALE_AFTER_DAYS` in `src/lib/directory.ts` applies to both the
  directory and matching. Don't show a listing anywhere once it's stale or past its
  deadline.
- **Contacts:** sample contacts must use `example.com` emails. The app never sends
  messages; it only drafts them.
- **Art:** no illustrations. The brand mark is the stroke icon in
  `src/components/Icon.tsx`; the homepage photo is `public/campus.jpg`, credited via
  `PHOTO_CREDIT` in `src/data/site.ts`. No university crests, logos or wordmarks.
- **Style:** design tokens (light and dark) live at the top of `src/index.css`. Use
  them rather than raw colours; check new text/background pairs reach 4.5:1.
- **Study mode:** `src/lib/study.ts` is off unless `?study=1`. It logs to
  localStorage only; never send it anywhere.
- **UI:** keep it accessible: real form controls, visible focus, labels on every
  input, works at 390px wide, light and dark mode.
- `paper-prototype-reference/` is a separate static file for the CSC318 paper
  prototype. Leave it alone unless asked.
