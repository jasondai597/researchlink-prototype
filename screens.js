// Drawing notes for each screen: which concept it comes from, which A1 design
// requirements (DR1–DR5) it serves, and what to draw on paper.
// Shown in the yellow panel when "Drawing notes" is on.

window.DRS = {
  DR1: "Find what's open",
  DR2: "Know what's required",
  DR3: "Feel ready to reach out",
  DR4: "Ease the screening load",
  DR5: "Agree on time & style",
};

window.CONCEPTS = {
  A: "Resource integration platform",
  B: "Research roadmap",
  C: "Informal, low-stakes communication",
};

window.SCREENS = {
  home: {
    id: "S1", name: "Home", concepts: ["A", "B"], drs: ["DR1"],
    purpose: "Two ways in: browse everything that's open, or answer 3 questions for a personal plan.",
    draw: ["Headline + one sentence", "Two big entry buttons: Browse open projects / Get my roadmap", "Count of open projects and when last updated", "Link to supervisor view"],
  },
  browse: {
    id: "S2", name: "Browse open projects", concepts: ["A", "B"], drs: ["DR1", "DR2", "DR5"],
    purpose: "Every open posting in one place, collected from scattered sources, with status and time commitment up front.",
    draw: ["Search box", "Filter row: category, compensation, max hours/week", "Project cards: title, lab, source tag, 'Open · confirmed N days ago', hours, compensation", "Fit badge on each card (only after the roadmap questions)"],
  },
  categories: {
    id: "S3", name: "Categories", concepts: ["A"], drs: ["DR1"],
    purpose: "Browse by research area when you don't know what to search for.",
    draw: ["Grid of research areas", "Number of open projects in each"],
  },
  project: {
    id: "S4", name: "Project details", concepts: ["A", "B", "C"], drs: ["DR2", "DR3", "DR5"],
    purpose: "Everything needed to judge fit and make first contact, without emailing anyone first.",
    draw: ["Status line + source", "Must-have vs. learn-on-the-job skills (two columns)", "Time, length, working style, first task", "Fit card (B): Fit %, must-haves met, availability, gaps", "How this lab prefers to be contacted (C)", "Lab Q&A thread (C)", "Actions: Request a 10-min chat / Save to tracker / Apply on lab's form"],
  },
  roadmapStart: {
    id: "S5", name: "Roadmap: 3 questions", concepts: ["B"], drs: ["DR2"],
    purpose: "Find out where the student is starting from in under a minute.",
    draw: ["Step indicator (1 of 3)", "Q1 year + experience", "Q2 skills you already have (chips)", "Q3 credit/paid/volunteer, hours, areas", "Back / Next buttons"],
  },
  roadmap: {
    id: "S6", name: "My roadmap", concepts: ["B"], drs: ["DR2", "DR3"],
    purpose: "A personal route with deadlines, plus the best-fitting projects right now.",
    draw: ["Timeline of 3–4 steps with dates", "Top matches with fit cards", "Edit answers link"],
  },
  request: {
    id: "S7", name: "Request a 10-min chat", concepts: ["C", "B"], drs: ["DR3", "DR4", "DR5"],
    purpose: "Replace the cold email with a short, structured drop-in request that the lab said it prefers.",
    draw: ["Lab's preferred channel and times", "Pick a time slot", "Snapshot preview (attached automatically)", "Short message with a starter template", "Checklist before sending (B)", "Send button → 'Request sent' state"],
  },
  snapshot: {
    id: "S8", name: "My candidate snapshot", concepts: ["C"], drs: ["DR3", "DR4"],
    purpose: "A compact card that replaces a résumé + cover letter for a first contact.",
    draw: ["Form: background, top 3 skills, availability, project interest", "Live preview of the card", "Optional full résumé link"],
  },
  tracker: {
    id: "S9", name: "Contact tracker", concepts: ["B"], drs: ["DR3"],
    purpose: "Know where every request stands and when to follow up.",
    draw: ["List: project, what you did, status, date", "Follow-up reminder", "What to do if no reply"],
  },
  supervisor: {
    id: "S10", name: "Supervisor inbox", concepts: ["C"], drs: ["DR4", "DR5"],
    purpose: "A grad student or supervisor screens requests at a glance from snapshots, not long emails.",
    draw: ["List of request cards (snapshot + slot + message)", "Accept / Suggest another time / Decline buttons", "Link to contact preferences"],
  },
  prefs: {
    id: "S11", name: "Contact preferences", concepts: ["C"], drs: ["DR3", "DR5"],
    purpose: "Supervisors say how and when they want to be approached, so students don't guess.",
    draw: ["Preferred channel", "Times", "Who screens first", "Inquiry window", "Preview of how students see it"],
  },
};
