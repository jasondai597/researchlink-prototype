# ResearchLink

Helps UofT undergrads find research they can actually apply to. You answer a few
questions about your experience, skills, availability and interests; ResearchLink
matches you to research programs and projects, explains why each one fits, and turns
the deadlines into a step-by-step action plan you can add to your calendar.

**Status: prototype.** Every program, lab and deadline in it is a made-up sample.

## What it does

1. **Profile (intake):** year, program, research experience, skills (self-rated:
   familiar / can use it / confident), hours per week, terms, what you're looking for
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
   - **Shown as bands with reasons** (Strong match / Worth a try / Stretch), not as a
     percentage. The weights aren't calibrated against real outcomes, so a number
     would look more precise than it is.
3. **Results:** grouped into *Apply now* (deadline within 6 weeks, or rolling),
   *Plan ahead* and *Stretch picks*. Each card lists what fits, what's missing, and the
   documents you'll need.
4. **Action plan:** each step is scheduled backwards from its deadline (contact
   supervisors 35 days before, references 28, CV 14, transcript 10, statement 10,
   form 3, submit 2). Steps shared across applications, such as the CV, are merged.
   A step whose ideal date has already passed moves to today and is flagged. You can
   check steps off, export them to a calendar (.ics), or print the plan.

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
src/lib/match.test.ts       tests for both
src/components/             Intake, Results, Plan pages
```

## Roadmap

- [ ] Replace the sample data with verified UofT programs (each with a source URL and
      a last-verified date), then a small set of lab projects
- [ ] Embedding-based interest similarity (in the browser, no API)
- [ ] User testing with 3–5 undergrads; tune the weights from what they say
- [ ] Supervisor side: post a project with structured requirements

`paper-prototype-reference/` is the earlier clickable reference of all three CSC318
concepts, kept for the group's paper prototype.

*Student-built. Not affiliated with the University of Toronto.*
