# ResearchLink

Helps UofT undergrads find research they can actually apply to. You answer a few
questions about your experience, skills, availability and interests; ResearchLink
matches you to research programs and projects, explains why each one fits, and turns
the deadlines into a step-by-step action plan you can add to your calendar. Or skip
matching and browse every open listing, each one showing when it was last verified.

**Status: prototype.** Every program, lab and deadline in it is a made-up sample.

## What it does

1. **Profile (intake):** year, program, research experience, skills (for each one:
   not yet / want to learn / familiar / can use it / confident), hours per week, terms, what you're looking for
   (credit / paid / volunteer), interest areas plus a free-text description, and
   optional eligibility (GPA, federal award eligibility).
2. **Matching:**
   - **Hard filters first.** Passed deadlines, year limits, terms that don't overlap,
     and eligibility rules remove an opportunity, and the results page lists what was
     hidden and why.
   - **Then a weighted score:** skills 40% (full credit at the required level, half
     credit one level below), interests 30% (area overlap blended with TF-IDF cosine
     similarity between your free text and the listing), time 20%, experience 10%.
     A compensation type you didn't ask for reduces the score by 15%.
   - **Want to learn.** "Not yet" stores nothing. "Want to learn" never counts toward
     a required skill (the gap says "asks for …; you want to learn it"). When a
     listing teaches a skill you want to learn, the card says so ("You want to learn
     X, and this project teaches it on the job") and the score gets +0.05, once per
     listing, capped at 1.
   - **Shown as bands with reasons** (Strong match / Worth a try / Stretch), not as a
     percentage. The weights aren't calibrated against real outcomes, so a number
     would look more precise than it is.
3. **Results:** grouped into *Apply now* (deadline within 6 weeks, or rolling),
   *Plan ahead* and *Stretch picks*. Each card lists what fits, what's missing, and the
   documents you'll need.
4. **Directory:** every open listing in one place, searchable and filterable by
   type, area, compensation and term, sorted by most recently verified or by
   deadline. Each listing shows when it was last checked against its source.
   Listings past their deadline or not re-verified within 30 days are withdrawn from
   the directory *and* from matching, and the page says how many were withdrawn.
   You can add listings to your plan straight from here, without the intake.
5. **Action plan:** each step is scheduled backwards from its deadline (contact
   supervisors 35 days before, references 28, CV 14, transcript 10, statement 10,
   form 3, submit 2). Steps shared across applications, such as the CV, are merged.
   A step whose ideal date has already passed moves to today and is flagged. You can
   check steps off or print the plan.
7. **Calendar:** "Add all to calendar" downloads every step as `research-plan.ics`;
   each application in the Deadlines list has its own button that exports just its
   steps, including shared steps (CV, transcript, reference) that cover it. Event
   UIDs depend only on the step, so importing again updates events instead of
   duplicating them. After a download the app says how to import the file and marks
   the application "In your calendar". Each step also has a "Google Calendar ›" link
   that opens a prefilled all-day event in a new tab.
6. **Informal outreach:** when a listing has a contact, the plan adds a first-contact
   step 21 days before the deadline (within 2 days for rolling listings), named for
   the contact's preferred channel: a 10-minute chat, office hours or email. It shows
   the alternatives and a message draft built from your profile, with placeholders if
   you haven't filled one in. Copy it or open it in your email app; the site never
   sends anything itself.

Your answers stay in your own browser (localStorage). There is no backend.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # matching and plan tests
npm run build    # production build in dist/
```

## Code map

```
src/data/opportunities.ts   sample listings (replace with verified data)
src/data/catalog.ts         skills, areas, labels used by the form
src/lib/match.ts            filters, scoring, bands, reasons
src/lib/plan.ts             backwards scheduling, merging, .ics export
src/lib/directory.ts        freshness rules, directory filters and sorting
src/lib/outreach.ts         informal first-contact steps and message drafts
src/lib/store.ts            localStorage, loading older saved answers
src/lib/study.ts            usability-study event log (off unless ?study=1)
src/lib/*.test.ts           tests
src/data/site.ts            photo credit and alt text
src/components/             Intake, Results, Browse, Plan pages; StudyPanel; Icon (brand mark)
src/index.css               design tokens (light and dark) and all styles
public/campus.jpg           homepage photo (credited in the footer)
```

## Usability study mode

For facilitated sessions only; normal visitors never see it.

- **Start:** open the app with `?study=1`, e.g. `index.html?study=1#/start`. It stays
  on for that browser tab (sessionStorage). `?study=0` turns it off.
- **What it records** (to localStorage `researchlink-study`, in this browser only,
  never sent anywhere): `start_click`, `first_input` (first change to any form field),
  `submit_attempt` (with the validation error count), `results_view`, `add_to_plan` /
  `remove_from_plan` (listing id), `plan_view`, `calendar_export` (listing id or
  `all`), `google_calendar_click` (step id), `route` (every page change), `edit_click`
  and `back_click`.
- **Facilitator panel:** the "Study" button at the bottom left. Enter a participant
  ID; the timer runs from task start (the earlier of `start_click` and `first_input`)
  to the first `calendar_export`.
- **Export:** "Copy CSV" copies `participant, event, time (ISO), ms_since_start,
  detail`, one row per event. Paste it into a spreadsheet.
- **Next participant:** "Reset session" clears the log and the saved answers.

## Roadmap

- [ ] Replace the sample data with verified UofT programs (each with a source URL and
      a last-verified date), then a small set of lab projects
- [ ] Embedding-based interest similarity (in the browser, no API)
- [ ] User testing with 3–5 undergrads; tune the weights from what they say
- [ ] Supervisor side: post a project with structured requirements

`paper-prototype-reference/` is the earlier clickable reference of all three CSC318
concepts, kept for the group's paper prototype.

*Student-built. Not affiliated with the University of Toronto.*
