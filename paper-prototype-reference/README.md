# ResearchLink: clickable reference prototype (CSC318 Group 20)

A clickable web version of our three A2 concepts, so everyone draws the **paper
prototype** from the same screens. This is a drawing reference, not the A2
deliverable: the A2 prototype must still be hand-drawn with pen and paper.

All labs, people and projects in it are **fictional**.

## Open it (no install)

1. Download: green **Code** button → **Download ZIP**, then unzip. (Or `git clone` it.)
2. Double-click **`index.html`**. It opens in your browser. That's it.

Your clicks (roadmap answers, saved projects, requests) are stored only in your own
browser. To start over: **All screens** page → **Reset demo data**.

## How to use it for the paper prototype

- Turn on **Drawing notes** (top right, on by default). The yellow panel shows, for
  each screen: its ID (S1–S11), which concept it comes from, which A1 design
  requirements (DR1–DR5) it serves, and a checklist of what to draw.
- Open **All screens** (link at the bottom of the notes, or `index.html#/screens`) to
  split the screens among us. Draw each screen on its own sheet and write its ID in
  the corner so the "computer" in the think-aloud can find it fast.
- The DR tags are there for the report: the paper prototype section needs a
  rationale for each feature, and the storyboards must cite the requirements.

## Screens

| ID  | Screen | Concept | DRs |
|-----|--------|---------|-----|
| S1  | Home | A, B | DR1 |
| S2  | Browse open projects | A, B | DR1, DR2, DR5 |
| S3  | Categories | A | DR1 |
| S4  | Project details | A, B, C | DR2, DR3, DR5 |
| S5  | Roadmap: 3 questions | B | DR2 |
| S6  | My roadmap | B | DR2, DR3 |
| S7  | Request a 10-min chat | C, B | DR3, DR4, DR5 |
| S8  | My candidate snapshot | C | DR3, DR4 |
| S9  | Contact tracker | B | DR3 |
| S10 | Supervisor inbox | C | DR4, DR5 |
| S11 | Contact preferences | C | DR3, DR5 |

Concepts (from our S2a deck): **A** Resource integration platform · **B** Research
roadmap · **C** Informal, low-stakes communication.
Design requirements: **DR1** Find what's open · **DR2** Know what's required ·
**DR3** Feel ready to reach out · **DR4** Ease the screening load · **DR5** Agree on
time & style.

## Main flows (good think-aloud tasks)

1. Student who knows what they want: S1 → S2 → S4 → S7 → S9
2. Student who doesn't know where to start: S1 → S5 → S6 → S4 → S7
3. Preparing a first contact: S8 → S7 → S9
4. Supervisor: S10 (accept a request) → student's S9 shows "Chat confirmed"; S11 edits
   what students see on S4

## Things to decide as a group before drawing

This prototype includes **every** feature from all three concepts. A2 asks us to
pick or combine concepts *based on stakeholder feedback*, so cut what the feedback
didn't support. Open questions:

- **Fit score as a percentage.** A low score (try a project that shows "Fit 0%") may
  discourage students, which was our own top risk for Concept B. Keep it, switch to
  bands (Strong / Possible / Stretch), or drop the number? Worth testing in the
  think-aloud.
- **Too many first-contact options?** S4 offers chat request, save, and apply. Do
  participants know which to pick?
- **Supervisor side in scope?** S10–S11 serve DR4/DR5 but double the drawing work.

## Editing

- Projects, labs, skills, categories: `data.js`
- Screen notes (IDs, concepts, DRs, what to draw): `screens.js`
- Screens and behaviour: `app.js` · Styles: `styles.css`

Plain HTML/CSS/JavaScript, no build step. Built with help from Claude (AI); check the
course policy before reusing any of it in a submission.
