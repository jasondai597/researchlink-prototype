/* ResearchLink prototype — CSC318 Group 20.
 * A clickable reference for drawing the paper prototype. No server, no install:
 * open index.html in a browser. Everything is fake and stays in this browser.
 */
(function () {
  "use strict";

  const D = window.DATA;
  const STORAGE_KEY = "researchlink-prototype-v1";
  const COMP = { credit: "Course credit", paid: "Paid", volunteer: "Volunteer" };
  const YEARS = ["1st year", "2nd year", "3rd year", "4th year+"];
  const EXPERIENCE = ["No research experience yet", "Relevant coursework only", "Some research or RA work"];

  // ------------------------------------------------------------------ state
  function freshState() {
    return {
      notes: true,
      profile: null, // set by the roadmap questions
      draft: { year: "", experience: "", skills: [], comp: [], hours: 5, interests: [] },
      snapshot: { name: "", background: "", skills: [], availability: "", interest: "", resume: "" },
      tracker: [], // { id, projectId, kind: 'saved'|'chat'|'applied', status, date, slot, message }
      incoming: JSON.parse(JSON.stringify(D.incomingRequests)),
      prefs: Object.fromEntries(D.projects.map((p) => [p.id, { ...p.prefs }])),
      qa: Object.fromEntries(D.projects.map((p) => [p.id, p.qa.slice()])),
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign(freshState(), JSON.parse(raw));
    } catch (e) {
      /* storage unavailable: run in memory */
    }
    return freshState();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  // ------------------------------------------------------------------ helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const project = (id) => D.projects.find((p) => p.id === id);
  const category = (id) => D.categories.find((c) => c.id === id);
  const today = new Date();
  const fmtDate = (d) => d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  const addDays = (n) => new Date(today.getTime() + n * 86400000);

  function confirmedText(p) {
    if (p.confirmedDaysAgo === 0) return "Open · confirmed today";
    if (p.confirmedDaysAgo === 1) return "Open · confirmed yesterday";
    return `Open · confirmed ${p.confirmedDaysAgo} days ago`;
  }

  // Fit score (Concept B). 60 pts for must-haves, 25 for availability, 15 for interest,
  // minus 10 if the compensation type isn't one the student asked for.
  function fit(p, profile) {
    if (!profile) return null;
    const met = p.must.filter((s) => profile.skills.includes(s));
    const gaps = p.must.filter((s) => !profile.skills.includes(s));
    const mustScore = p.must.length ? (60 * met.length) / p.must.length : 60;
    const avail = profile.hours >= p.hoursPerWeek;
    const interest = profile.interests.includes(p.category);
    const compOk = profile.comp.length === 0 || profile.comp.includes(p.comp);
    const score = Math.max(0, Math.round(mustScore + (avail ? 25 : 0) + (interest ? 15 : 0) - (compOk ? 0 : 10)));
    return { score, met, gaps, avail, interest, compOk };
  }

  function fitCard(p, f, compact) {
    if (!f) return "";
    const lines = [
      p.must.length ? `Meets ${f.met.length} of ${p.must.length} must-have${p.must.length === 1 ? "" : "s"}` : "No must-have skills",
      f.avail ? "Availability matches" : `Needs ${p.hoursPerWeek} h/week; you said ${state.profile.hours}`,
      ...f.gaps.map((g) => `Gap: ${g}`),
    ];
    if (p.learnable.length) lines.push(`Learn on the job: ${p.learnable.join(", ")}`);
    if (!f.compOk) lines.push(`${COMP[p.comp]}, not what you asked for`);
    if (compact) return `<span class="fit-badge">Fit ${f.score}%</span>`;
    return `<div class="fit-card">
      <p class="fit-score">Fit ${f.score}%</p>
      <ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
      <p class="fit-why">Based on your roadmap answers. <a href="#/roadmap/start">Edit answers</a></p>
    </div>`;
  }

  function trackerEntry(projectId, kind) {
    return state.tracker.find((t) => t.projectId === projectId && t.kind === kind);
  }

  function addTracker(projectId, kind, extra = {}) {
    const existing = trackerEntry(projectId, kind);
    if (existing) return existing;
    const entry = { id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, projectId, kind, date: today.toISOString(), status: kind === "saved" ? "Saved" : "Sent", ...extra };
    state.tracker.unshift(entry);
    save();
    return entry;
  }

  function snapshotCardHTML(s) {
    const skills = (s.skills || []).filter(Boolean);
    return `<div class="snapshot">
      <p class="snap-name">${esc(s.name || "Your name")}</p>
      <dl>
        <dt>Background</dt><dd>${esc(s.background || "—")}</dd>
        <dt>Top skills</dt><dd>${skills.length ? skills.map(esc).join(", ") : "—"}</dd>
        <dt>Availability</dt><dd>${esc(s.availability || "—")}</dd>
        <dt>Project interest</dt><dd>${esc(s.interest || "—")}</dd>
      </dl>
    </div>`;
  }

  // ------------------------------------------------------------------ router
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, query = ""] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    return { parts, params: new URLSearchParams(query) };
  }

  const routes = {
    "": home,
    browse: browse,
    categories: categories,
    project: projectPage,
    roadmap: roadmapRoute,
    request: requestPage,
    snapshot: snapshotPage,
    tracker: trackerPage,
    supervisor: supervisorPage,
    prefs: prefsPage,
    screens: screensIndex,
  };

  function render() {
    const { parts, params } = parseHash();
    const handler = routes[parts[0] || ""] || notFound;
    const result = handler(parts.slice(1), params);
    $("#screen").innerHTML = result.html;
    renderNotes(result.screen);
    renderNav(parts[0] || "");
    document.body.classList.toggle("notes-on", state.notes);
    $("#notes-toggle").setAttribute("aria-pressed", String(state.notes));
    if (result.after) result.after();
    const h1 = $("#screen h1");
    if (h1) h1.setAttribute("tabindex", "-1");
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function renderNav(active) {
    const links = [
      ["browse", "Browse"],
      ["roadmap", "My roadmap"],
      ["tracker", "Tracker"],
      ["snapshot", "My snapshot"],
    ];
    const count = state.tracker.length;
    $("#nav").innerHTML =
      links
        .map(([k, label]) => {
          const extra = k === "tracker" && count ? ` <span class="count">${count}</span>` : "";
          return `<a href="#/${k}" ${active === k ? 'aria-current="page"' : ""}>${label}${extra}</a>`;
        })
        .join("") + `<a href="#/supervisor" class="nav-sup" ${active === "supervisor" || active === "prefs" ? 'aria-current="page"' : ""}>Supervisor view</a>`;
  }

  function renderNotes(key) {
    const el = $("#notes");
    const s = key && window.SCREENS[key];
    if (!s) {
      el.innerHTML = `<p class="note-id">Screen index</p><p>Not a screen to draw. Use it to split the screens among the group.</p>`;
      return;
    }
    el.innerHTML = `
      <p class="note-id">${s.id} · ${esc(s.name)}</p>
      <p class="note-tags">${s.concepts.map((c) => `<span class="tag tag-${c}" title="${esc(window.CONCEPTS[c])}">Concept ${c}</span>`).join("")}</p>
      <p class="note-tags">${s.drs.map((d) => `<span class="tag tag-dr" title="${esc(window.DRS[d])}">${d}</span>`).join("")}</p>
      <p>${esc(s.purpose)}</p>
      <p class="note-sub">Draw these</p>
      <ul>${s.draw.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
      <p class="note-sub">Design requirements</p>
      <ul class="dr-list">${s.drs.map((d) => `<li><b>${d}</b> ${esc(window.DRS[d])}</li>`).join("")}</ul>
      <p><a href="#/screens">All screens</a></p>`;
  }

  // ------------------------------------------------------------------ S1 home
  function home() {
    const n = D.projects.length;
    const newest = Math.min(...D.projects.map((p) => p.confirmedDaysAgo));
    return {
      screen: "home",
      html: `
      <section class="hero">
        <h1>Find research you can start this term.</h1>
        <p class="lede">Every open undergrad research position we can find, in one place, with what it really takes and how the lab wants to be contacted.</p>
        <div class="entry-row">
          <a class="entry" href="#/browse">
            <span class="entry-title">Browse open projects</span>
            <span class="entry-sub">${n} open now · newest confirmed ${newest === 0 ? "today" : newest + " days ago"}</span>
          </a>
          <a class="entry entry-alt" href="#/roadmap/start">
            <span class="entry-title">Not sure where to start?</span>
            <span class="entry-sub">Answer 3 questions and get a roadmap with deadlines</span>
          </a>
        </div>
        <p class="muted">Supervising undergrads? <a href="#/supervisor">Open the supervisor view</a>.</p>
      </section>`,
    };
  }

  // ------------------------------------------------------------------ S2 browse
  function browse(_, params) {
    const q = (params.get("q") || "").trim().toLowerCase();
    const cat = params.get("cat") || "";
    const comp = params.get("comp") || "";
    const maxH = parseInt(params.get("hours") || "0", 10);
    let list = D.projects.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (comp && p.comp !== comp) return false;
      if (maxH && p.hoursPerWeek > maxH) return false;
      if (q) {
        const hay = [p.title, p.lab, p.summary, ...p.must, ...p.learnable, category(p.category).name].join(" ").toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const sort = params.get("sort") || (state.profile ? "fit" : "fresh");
    if (sort === "fit" && state.profile) list.sort((a, b) => fit(b, state.profile).score - fit(a, state.profile).score);
    else list.sort((a, b) => a.confirmedDaysAgo - b.confirmedDaysAgo);

    const opt = (v, label, cur) => `<option value="${v}" ${v === cur ? "selected" : ""}>${label}</option>`;
    const cards = list
      .map((p) => {
        const f = fit(p, state.profile);
        const saved = trackerEntry(p.id, "saved");
        return `<li class="card">
          <div class="card-main">
            <p class="card-meta">${esc(p.lab)} · ${esc(category(p.category).name)}</p>
            <h2><a href="#/project/${p.id}">${esc(p.title)}</a></h2>
            <p>${esc(p.summary)}</p>
            <p class="card-facts"><span class="status">${confirmedText(p)}</span> · ${p.hoursPerWeek} h/week · ${COMP[p.comp]} · <span class="source">From: ${esc(D.sources[p.source])}</span>${saved ? ' · <span class="saved">Saved</span>' : ""}</p>
          </div>
          <div class="card-side">${f ? fitCard(p, f, true) : ""}</div>
        </li>`;
      })
      .join("");

    return {
      screen: "browse",
      html: `
      <h1>Open projects</h1>
      <p class="muted">Collected from department pages, lab websites, mailing lists and job portals. Closed or unconfirmed postings are hidden.</p>
      <form class="filters" id="filters">
        <label class="grow">Search<input type="search" name="q" value="${esc(params.get("q") || "")}" placeholder="Skill, topic or lab"></label>
        <label>Area<select name="cat"><option value="">All areas</option>${D.categories.map((c) => opt(c.id, esc(c.name), cat)).join("")}</select></label>
        <label>Compensation<select name="comp">${opt("", "Any", comp)}${Object.entries(COMP).map(([k, v]) => opt(k, v, comp)).join("")}</select></label>
        <label>Max hours/week<select name="hours">${opt("0", "Any", String(maxH))}${[3, 5, 8].map((h) => opt(String(h), `${h} or fewer`, String(maxH))).join("")}</select></label>
        ${state.profile ? `<label>Sort<select name="sort">${opt("fit", "Best fit", sort)}${opt("fresh", "Recently confirmed", sort)}</select></label>` : ""}
        <button type="submit" class="btn">Show</button>
      </form>
      <p class="result-line">${list.length} open ${list.length === 1 ? "project" : "projects"} · <a href="#/categories">Browse by area</a>${state.profile ? "" : ' · <a href="#/roadmap/start">See your fit for each project</a>'}</p>
      ${list.length ? `<ul class="cards">${cards}</ul>` : `<div class="empty"><p><b>No open projects match.</b></p><p>Try fewer filters, or <a href="#/browse">clear them</a>.</p></div>`}`,
      after() {
        $("#filters").addEventListener("submit", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const qs = new URLSearchParams();
          for (const [k, v] of fd) if (v && v !== "0") qs.set(k, v);
          go(`#/browse${qs.toString() ? "?" + qs : ""}`);
        });
      },
    };
  }

  // ------------------------------------------------------------------ S3 categories
  function categories() {
    return {
      screen: "categories",
      html: `
      <h1>Browse by area</h1>
      <ul class="cat-grid">${D.categories
        .map((c) => {
          const n = D.projects.filter((p) => p.category === c.id).length;
          return `<li><a href="#/browse?cat=${c.id}"><span class="cat-name">${esc(c.name)}</span><span class="cat-count">${n} open</span></a></li>`;
        })
        .join("")}</ul>`,
    };
  }

  // ------------------------------------------------------------------ S4 project
  function projectPage([id]) {
    const p = project(id);
    if (!p) return notFound();
    const f = fit(p, state.profile);
    const prefs = state.prefs[p.id];
    const qa = state.qa[p.id];
    const saved = trackerEntry(p.id, "saved");
    const chat = trackerEntry(p.id, "chat");
    const skillList = (items, empty) => (items.length ? `<ul class="chips">${items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : `<p class="muted">${empty}</p>`);

    return {
      screen: "project",
      html: `
      <p><a href="#/browse">← All open projects</a></p>
      <p class="card-meta">${esc(p.lab)} · ${esc(category(p.category).name)}</p>
      <h1>${esc(p.title)}</h1>
      <p class="status-line"><span class="status">${confirmedText(p)}</span> · From: ${esc(D.sources[p.source])}</p>

      <div class="detail-grid">
        <div>
          <p>${esc(p.summary)}</p>
          <div class="two-col">
            <div><h2 class="h3">You need</h2>${skillList(p.must, "No prior skills needed.")}</div>
            <div><h2 class="h3">You'll learn on the job</h2>${skillList(p.learnable, "Nothing listed.")}</div>
          </div>
          <dl class="facts">
            <dt>Time</dt><dd>${p.hoursPerWeek} hours a week for about ${p.weeks} weeks</dd>
            <dt>Working style</dt><dd>${esc(p.style)}</dd>
            <dt>Your first task</dt><dd>${esc(p.firstTask)}</dd>
            <dt>Compensation</dt><dd>${COMP[p.comp]}</dd>
            <dt>Contact</dt><dd>${esc(p.contact)}, ${esc(p.contactRole)}</dd>
          </dl>

          <section class="box">
            <h2 class="h3">How this lab prefers to be contacted</h2>
            <dl class="facts">
              <dt>Channel</dt><dd>${esc(prefs.channel)}</dd>
              <dt>When</dt><dd>${esc(prefs.times)}</dd>
              <dt>Who reads it first</dt><dd>${esc(prefs.gatekeeper)}</dd>
              <dt>Inquiry window</dt><dd>${esc(prefs.window)}</dd>
            </dl>
          </section>

          <section>
            <h2 class="h3">Questions about this lab</h2>
            ${qa.length ? `<ul class="qa">${qa.map((x) => `<li><p class="q">${esc(x.q)}</p>${x.a ? `<p class="a">${esc(x.a)} <span class="muted">— ${esc(x.by)}</span></p>` : `<p class="a muted">Waiting for an answer</p>`}</li>`).join("")}</ul>` : `<p class="muted">No questions yet. Ask the first one.</p>`}
            <form id="ask" class="ask">
              <label for="ask-q">Ask a quick question (visible to everyone)</label>
              <div class="row"><input id="ask-q" name="q" required maxlength="200" placeholder="e.g., Is this open to first-years?"><button class="btn btn-quiet" type="submit">Post question</button></div>
            </form>
          </section>
        </div>

        <aside class="detail-side">
          ${f ? fitCard(p, f, false) : `<div class="fit-card fit-empty"><p><b>How well do you fit?</b></p><p>Answer 3 quick questions to see which must-haves you meet.</p><a class="btn btn-quiet" href="#/roadmap/start">Check my fit</a></div>`}
          <div class="actions">
            ${chat ? `<p class="done">${chat.status === "Sent" ? "Chat request sent" : esc(chat.status)} · <a href="#/tracker">View in tracker</a></p>` : `<a class="btn" href="#/request/${p.id}">Request a 10-min chat</a>`}
            <button class="btn btn-quiet" id="save" type="button" ${saved ? "disabled" : ""}>${saved ? "Saved to tracker" : "Save to tracker"}</button>
            <button class="btn btn-quiet" id="apply" type="button">Apply on the lab's form</button>
          </div>
        </aside>
      </div>`,
      after() {
        $("#save").addEventListener("click", () => {
          addTracker(p.id, "saved");
          render();
        });
        $("#apply").addEventListener("click", () => {
          addTracker(p.id, "applied", { status: "Applied on lab's form" });
          alertInline("Prototype: this would open the lab's own form. Added to your tracker.");
        });
        $("#ask").addEventListener("submit", (e) => {
          e.preventDefault();
          const q = e.target.q.value.trim();
          if (!q) return;
          state.qa[p.id].push({ q, a: "", by: "" });
          save();
          render();
        });
      },
    };
  }

  function alertInline(msg) {
    const el = document.createElement("p");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // ------------------------------------------------------------------ S5/S6 roadmap
  function roadmapRoute(parts, params) {
    if (parts[0] === "start") return roadmapStart(params);
    if (!state.profile) return roadmapStart(params);
    return roadmapPage();
  }

  function roadmapStart(params) {
    const step = Math.min(3, Math.max(1, parseInt(params.get("step") || "1", 10)));
    const d = state.draft;
    const chip = (name, value, checked, label) =>
      `<label class="chip-input"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked ? "checked" : ""}><span>${esc(label)}</span></label>`;
    const radio = (name, value, checked, label) =>
      `<label class="radio"><input type="radio" name="${name}" value="${esc(value)}" ${checked ? "checked" : ""} required><span>${esc(label)}</span></label>`;

    let body = "";
    if (step === 1) {
      body = `
        <fieldset><legend>What year are you in?</legend>${YEARS.map((y) => radio("year", y, d.year === y, y)).join("")}</fieldset>
        <fieldset><legend>Have you done research before?</legend>${EXPERIENCE.map((x) => radio("experience", x, d.experience === x, x)).join("")}</fieldset>`;
    } else if (step === 2) {
      body = `<fieldset><legend>Which of these can you already do? Pick any.</legend><div class="chip-row">${D.skills.map((s) => chip("skills", s, d.skills.includes(s), s)).join("")}</div></fieldset>`;
    } else {
      body = `
        <fieldset><legend>What are you looking for? Pick any.</legend><div class="chip-row">${Object.entries(COMP).map(([k, v]) => chip("comp", k, d.comp.includes(k), v)).join("")}</div></fieldset>
        <label class="field">Hours a week you can give<input type="number" name="hours" min="1" max="20" value="${d.hours}" required></label>
        <fieldset><legend>Areas you're curious about</legend><div class="chip-row">${D.categories.map((c) => chip("interests", c.id, d.interests.includes(c.id), c.name)).join("")}</div></fieldset>`;
    }

    return {
      screen: "roadmapStart",
      html: `
      <p class="step">Question ${step} of 3</p>
      <div class="progress" aria-hidden="true"><span style="width:${(step / 3) * 100}%"></span></div>
      <h1>${["Where are you now?", "What can you already do?", "What do you want?"][step - 1]}</h1>
      <form id="q" class="qform">${body}
        <div class="row">
          ${step > 1 ? `<a class="btn btn-quiet" href="#/roadmap/start?step=${step - 1}">Back</a>` : ""}
          <button class="btn" type="submit">${step < 3 ? "Next" : "See my roadmap"}</button>
        </div>
      </form>`,
      after() {
        $("#q").addEventListener("submit", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          if (step === 1) {
            d.year = fd.get("year");
            d.experience = fd.get("experience");
          } else if (step === 2) {
            d.skills = fd.getAll("skills");
          } else {
            d.comp = fd.getAll("comp");
            d.hours = Math.max(1, parseInt(fd.get("hours"), 10) || 5);
            d.interests = fd.getAll("interests");
            state.profile = JSON.parse(JSON.stringify(d));
            if (!state.snapshot.skills.length) state.snapshot.skills = d.skills.slice(0, 3);
            if (!state.snapshot.availability) state.snapshot.availability = `${d.hours} h/week`;
            if (!state.snapshot.background && d.year) state.snapshot.background = d.year;
          }
          save();
          go(step < 3 ? `#/roadmap/start?step=${step + 1}` : "#/roadmap");
        });
      },
    };
  }

  function roadmapSteps(profile) {
    const novice = profile.experience === EXPERIENCE[0];
    const early = profile.year === YEARS[0] || profile.year === YEARS[1];
    const wantsCredit = profile.comp.includes("credit");
    const steps = [];
    steps.push({
      when: "This week",
      date: addDays(3),
      title: "Make your candidate snapshot",
      body: "One card with your background, top skills and availability. Labs see it instead of a cover letter.",
      link: ["#/snapshot", "Make my snapshot"],
    });
    steps.push({
      when: "Next 2 weeks",
      date: addDays(14),
      title: novice ? "Start small: a volunteer or data-collection role" : "Request chats with 2–3 labs that fit",
      body: novice
        ? "Most undergrads start with data collection or labelling. It builds the experience later applications ask for."
        : "Use a 10-minute chat instead of a cold email. Labs list how they like to be contacted.",
      link: ["#/browse?sort=fit", "See matching projects"],
    });
    if (wantsCredit || !early) {
      steps.push({
        when: "Before winter term",
        date: addDays(35),
        title: "Line up a course-credit research project",
        body: "Credit projects need a supervisor's OK before the term starts. Ask during your chats. (Sample deadline.)",
        link: ["#/browse?comp=credit", "Credit projects"],
      });
    }
    steps.push({
      when: "Winter",
      date: addDays(95),
      title: "Apply for a summer research position",
      body: "Summer awards usually close in late winter. Starting outreach in February is often too late. (Sample deadline.)",
      link: null,
    });
    return steps;
  }

  function roadmapPage() {
    const p = state.profile;
    const steps = roadmapSteps(p);
    const top = D.projects
      .map((x) => ({ x, f: fit(x, p) }))
      .sort((a, b) => b.f.score - a.f.score)
      .slice(0, 3);
    return {
      screen: "roadmap",
      html: `
      <h1>Your roadmap</h1>
      <p class="muted">${esc(p.year)} · ${esc(p.experience)} · ${p.hours} h/week · <a href="#/roadmap/start">Edit answers</a></p>
      <ol class="timeline">${steps
        .map(
          (s) => `<li>
          <p class="tl-when">${esc(s.when)} · by ${fmtDate(s.date)}</p>
          <h2 class="h3">${esc(s.title)}</h2>
          <p>${esc(s.body)}</p>
          ${s.link ? `<a href="${s.link[0]}">${esc(s.link[1])}</a>` : ""}
        </li>`
        )
        .join("")}</ol>
      <h2>Best fits right now</h2>
      <ul class="cards">${top
        .map(
          ({ x, f }) => `<li class="card">
          <div class="card-main">
            <p class="card-meta">${esc(x.lab)}</p>
            <h3 class="h3"><a href="#/project/${x.id}">${esc(x.title)}</a></h3>
            <p class="card-facts">${x.hoursPerWeek} h/week · ${COMP[x.comp]} · <span class="status">${confirmedText(x)}</span></p>
          </div>
          <div class="card-side">${fitCard(x, f, false)}</div>
        </li>`
        )
        .join("")}</ul>`,
    };
  }

  // ------------------------------------------------------------------ S7 request a chat
  function requestPage([id], params) {
    const p = project(id);
    if (!p) return notFound();
    const prefs = state.prefs[p.id];
    const sent = trackerEntry(p.id, "chat");
    if (sent || params.get("sent")) {
      const entry = sent;
      return {
        screen: "request",
        html: `
        <h1>Request sent</h1>
        <p>${esc(p.contact)} will see your snapshot and the time you picked${entry && entry.slot ? ` (<b>${esc(entry.slot)}</b>)` : ""}.</p>
        <p><b>When this lab responds:</b> ${esc(prefs.times)}</p>
        <p>If you don't hear back in 5 days, we'll remind you to follow up once.</p>
        <div class="row"><a class="btn" href="#/tracker">Go to my tracker</a><a class="btn btn-quiet" href="#/browse">Keep browsing</a></div>`,
      };
    }
    const slots = ["Tue 2:30 p.m.", "Tue 3:30 p.m.", "Thu 2:00 p.m.", "Thu 3:00 p.m."];
    const s = state.snapshot;
    const template = `Hi ${p.contact.split(" ")[0]}, I'm interested in "${p.title}". Could I drop in for 10 minutes to ask what the first few weeks look like?`;
    const checks = ["I read the must-have skills", "I mentioned what interests me about this project", "My availability is on my snapshot"];

    return {
      screen: "request",
      html: `
      <p><a href="#/project/${p.id}">← ${esc(p.title)}</a></p>
      <h1>Request a 10-minute chat</h1>
      <p class="muted">${esc(p.lab)} prefers <b>${esc(prefs.channel)}</b> · ${esc(prefs.times)} · Read first by ${esc(prefs.gatekeeper)}</p>
      <form id="req" class="req-grid">
        <div>
          <fieldset><legend>Pick a time</legend><div class="chip-row">${slots.map((t, i) => `<label class="radio"><input type="radio" name="slot" value="${t}" ${i === 0 ? "checked" : ""}><span>${t}</span></label>`).join("")}</div></fieldset>
          <label class="field">Short message (optional)<textarea name="message" rows="4" maxlength="300">${esc(template)}</textarea></label>
          <fieldset><legend>Before you send</legend>${checks.map((c) => `<label class="check"><input type="checkbox" name="check"><span>${esc(c)}</span></label>`).join("")}</fieldset>
          <div class="row"><button class="btn" type="submit">Send request</button><a class="btn btn-quiet" href="#/project/${p.id}">Cancel</a></div>
        </div>
        <div>
          <p class="note-sub">Sent with your snapshot</p>
          ${snapshotCardHTML(s)}
          <p><a href="#/snapshot">Edit my snapshot</a></p>
        </div>
      </form>`,
      after() {
        $("#req").addEventListener("submit", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          addTracker(p.id, "chat", { slot: fd.get("slot"), message: String(fd.get("message") || "").trim() });
          go(`#/request/${p.id}?sent=1`);
        });
      },
    };
  }

  // ------------------------------------------------------------------ S8 snapshot
  function snapshotPage() {
    const s = state.snapshot;
    return {
      screen: "snapshot",
      html: `
      <h1>My candidate snapshot</h1>
      <p class="muted">Labs see this card instead of a résumé and cover letter when you request a chat.</p>
      <div class="req-grid">
        <form id="snap" class="qform">
          <label class="field">Name<input name="name" value="${esc(s.name)}" maxlength="60" placeholder="First name and last initial"></label>
          <label class="field">Background<input name="background" value="${esc(s.background)}" maxlength="80" placeholder="e.g., 2nd year, Statistics"></label>
          <fieldset><legend>Top skills (pick up to 3)</legend><div class="chip-row">${D.skills.map((k) => `<label class="chip-input"><input type="checkbox" name="skills" value="${esc(k)}" ${s.skills.includes(k) ? "checked" : ""}><span>${esc(k)}</span></label>`).join("")}</div></fieldset>
          <label class="field">Availability<input name="availability" value="${esc(s.availability)}" maxlength="60" placeholder="e.g., 6 h/week, weekday afternoons"></label>
          <label class="field">Project interest<textarea name="interest" rows="2" maxlength="140" placeholder="One sentence: what you'd like to work on and why">${esc(s.interest)}</textarea></label>
          <label class="field">Full résumé link (optional)<input name="resume" value="${esc(s.resume)}" placeholder="https://"></label>
          <div class="row"><button class="btn" type="submit">Save snapshot</button></div>
        </form>
        <div><p class="note-sub">Preview</p><div id="snap-preview">${snapshotCardHTML(s)}</div></div>
      </div>`,
      after() {
        const form = $("#snap");
        const read = () => {
          const fd = new FormData(form);
          return { name: fd.get("name"), background: fd.get("background"), skills: fd.getAll("skills").slice(0, 3), availability: fd.get("availability"), interest: fd.get("interest"), resume: fd.get("resume") };
        };
        form.addEventListener("input", () => {
          const boxes = form.querySelectorAll('input[name="skills"]');
          const checked = [...boxes].filter((b) => b.checked).length;
          boxes.forEach((b) => (b.disabled = !b.checked && checked >= 3));
          $("#snap-preview").innerHTML = snapshotCardHTML(read());
        });
        form.dispatchEvent(new Event("input"));
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          state.snapshot = read();
          save();
          alertInline("Snapshot saved.");
        });
      },
    };
  }

  // ------------------------------------------------------------------ S9 tracker
  function trackerPage() {
    const rows = state.tracker
      .map((t) => {
        const p = project(t.projectId);
        if (!p) return "";
        const kind = { saved: "Saved", chat: "Chat request", applied: "Applied on lab's form" }[t.kind];
        const followUp = t.kind !== "saved" && t.status === "Sent" ? `<p class="muted">Follow up on ${fmtDate(addDays(5))} if no reply. No reply after that? Try the lab's Q&A thread or another lab.</p>` : "";
        return `<li class="card">
          <div class="card-main">
            <p class="card-meta">${esc(p.lab)} · ${kind}${t.slot ? ` · ${esc(t.slot)}` : ""}</p>
            <h2 class="h3"><a href="#/project/${p.id}">${esc(p.title)}</a></h2>
            ${followUp}
          </div>
          <div class="card-side"><span class="pill pill-${t.status.split(" ")[0].toLowerCase()}">${esc(t.status)}</span></div>
        </li>`;
      })
      .join("");
    return {
      screen: "tracker",
      html: `
      <h1>Contact tracker</h1>
      <p class="muted">Everyone you've saved, contacted or applied to, and what to do next.</p>
      ${state.tracker.length ? `<ul class="cards">${rows}</ul>` : `<div class="empty"><p><b>Nothing here yet.</b></p><p>Save a project or request a chat and it shows up here. <a href="#/browse">Browse open projects</a></p></div>`}`,
    };
  }

  // ------------------------------------------------------------------ S10 supervisor inbox
  function supervisorPage() {
    const mine = "transit-sentiment"; // the demo supervisor: Maya Chen
    const p = project(mine);
    const fromStudent = state.tracker
      .filter((t) => t.kind === "chat" && t.projectId === mine)
      .map((t) => ({
        id: t.id,
        fromTracker: true,
        projectId: t.projectId,
        student: { ...state.snapshot, name: state.snapshot.name || "You (student demo)" },
        slot: t.slot,
        message: t.message,
        status: t.status === "Sent" ? "new" : t.status === "Chat confirmed" ? "accepted" : t.status === "Declined" ? "declined" : "suggested",
      }));
    const all = [...fromStudent, ...state.incoming];
    const label = { new: "New", accepted: "Accepted", suggested: "New time suggested", declined: "Declined" };

    return {
      screen: "supervisor",
      html: `
      <p class="muted">Signed in as Maya Chen, PhD student · ${esc(p.lab)}</p>
      <h1>Chat requests</h1>
      <p class="muted">For “${esc(p.title)}”. Each request is a snapshot, a time from your office hours, and an optional short note. <a href="#/prefs">Edit how students should contact you</a></p>
      ${all.length ? `<ul class="inbox">${all
        .map(
          (r) => `<li class="inbox-item">
          ${snapshotCardHTML(r.student)}
          <div class="inbox-side">
            <p><b>Requested:</b> ${esc(r.slot || "—")}</p>
            ${r.message ? `<p class="msg">“${esc(r.message)}”</p>` : ""}
            ${r.status === "new" ? `<div class="row">
              <button class="btn" data-act="accept" data-id="${r.id}" data-src="${r.fromTracker ? "t" : "i"}">Accept</button>
              <button class="btn btn-quiet" data-act="suggest" data-id="${r.id}" data-src="${r.fromTracker ? "t" : "i"}">Suggest another time</button>
              <button class="btn btn-quiet" data-act="decline" data-id="${r.id}" data-src="${r.fromTracker ? "t" : "i"}">Decline politely</button>
            </div>` : `<p><span class="pill pill-${r.status}">${label[r.status]}</span></p>`}
          </div>
        </li>`
        )
        .join("")}</ul>` : `<div class="empty"><p><b>No requests yet.</b></p></div>`}`,
      after() {
        document.querySelectorAll("[data-act]").forEach((b) =>
          b.addEventListener("click", () => {
            const { act, id, src } = b.dataset;
            const status = { accept: "accepted", suggest: "suggested", decline: "declined" }[act];
            if (src === "i") {
              const r = state.incoming.find((x) => x.id === id);
              if (r) r.status = status;
            } else {
              const t = state.tracker.find((x) => x.id === id);
              if (t) t.status = { accepted: "Chat confirmed", suggested: "New time suggested", declined: "Declined" }[status];
            }
            save();
            render();
          })
        );
      },
    };
  }

  // ------------------------------------------------------------------ S11 contact preferences
  function prefsPage() {
    const id = "transit-sentiment";
    const pr = state.prefs[id];
    const channels = ["Drop-in chat (10 min)", "Office hours drop-in", "Email with snapshot", "Lab Q&A thread first"];
    return {
      screen: "prefs",
      html: `
      <p><a href="#/supervisor">← Chat requests</a></p>
      <h1>How students should contact you</h1>
      <div class="req-grid">
        <form id="prefs" class="qform">
          <fieldset><legend>Preferred channel</legend>${channels.map((c) => `<label class="radio"><input type="radio" name="channel" value="${esc(c)}" ${pr.channel === c ? "checked" : ""}><span>${esc(c)}</span></label>`).join("")}</fieldset>
          <label class="field">When<input name="times" value="${esc(pr.times)}" maxlength="60"></label>
          <label class="field">Who reads requests first<input name="gatekeeper" value="${esc(pr.gatekeeper)}" maxlength="80"></label>
          <label class="field">Inquiry window<input name="window" value="${esc(pr.window)}" maxlength="80"></label>
          <div class="row"><button class="btn" type="submit">Save preferences</button></div>
        </form>
        <div>
          <p class="note-sub">Students see this on your project</p>
          <section class="box" id="prefs-preview"></section>
        </div>
      </div>`,
      after() {
        const form = $("#prefs");
        const read = () => Object.fromEntries(new FormData(form));
        const preview = () => {
          const v = read();
          $("#prefs-preview").innerHTML = `<h2 class="h3">How this lab prefers to be contacted</h2><dl class="facts"><dt>Channel</dt><dd>${esc(v.channel)}</dd><dt>When</dt><dd>${esc(v.times)}</dd><dt>Who reads it first</dt><dd>${esc(v.gatekeeper)}</dd><dt>Inquiry window</dt><dd>${esc(v.window)}</dd></dl>`;
        };
        form.addEventListener("input", preview);
        preview();
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          state.prefs[id] = read();
          save();
          alertInline("Preferences saved. Students now see them on your project.");
        });
      },
    };
  }

  // ------------------------------------------------------------------ screen index
  function screensIndex() {
    const firstProject = D.projects[0].id;
    const links = {
      home: "#/",
      browse: "#/browse",
      categories: "#/categories",
      project: `#/project/${firstProject}`,
      roadmapStart: "#/roadmap/start",
      roadmap: "#/roadmap",
      request: `#/request/${firstProject}`,
      snapshot: "#/snapshot",
      tracker: "#/tracker",
      supervisor: "#/supervisor",
      prefs: "#/prefs",
    };
    const rows = Object.entries(window.SCREENS)
      .map(
        ([k, s]) => `<tr>
        <td><b>${s.id}</b></td>
        <td><a href="${links[k]}">${esc(s.name)}</a></td>
        <td>${s.concepts.map((c) => `<span class="tag tag-${c}">${c}</span>`).join(" ")}</td>
        <td>${s.drs.join(", ")}</td>
        <td>${esc(s.purpose)}</td>
      </tr>`
      )
      .join("");
    return {
      screen: null,
      html: `
      <h1>All screens</h1>
      <p class="muted">Split these among the group for drawing. Concept A = ${esc(window.CONCEPTS.A)}, B = ${esc(window.CONCEPTS.B)}, C = ${esc(window.CONCEPTS.C)}.</p>
      <div class="table-wrap"><table class="screens">
        <thead><tr><th>ID</th><th>Screen</th><th>Concept</th><th>DRs</th><th>What it's for</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <h2>Main flows</h2>
      <ol class="flows">
        <li><b>Student, knows what they want:</b> S1 → S2 → S4 → S7 → S9</li>
        <li><b>Student, doesn't know where to start:</b> S1 → S5 → S6 → S4 → S7</li>
        <li><b>Student, first contact prep:</b> S8 → S7 → S9</li>
        <li><b>Supervisor:</b> S10 → S11, and S10 accept → student's S9 updates</li>
      </ol>
      <p><button class="btn btn-quiet" id="reset" type="button">Reset demo data</button></p>`,
      after() {
        $("#reset").addEventListener("click", () => {
          const notes = state.notes;
          state = freshState();
          state.notes = notes;
          save();
          alertInline("Demo data reset.");
          render();
        });
      },
    };
  }

  function notFound() {
    return { screen: null, html: `<h1>Screen not found</h1><p><a href="#/">Go to home</a> or <a href="#/screens">see all screens</a>.</p>` };
  }

  // ------------------------------------------------------------------ boot
  $("#notes-toggle").addEventListener("click", () => {
    state.notes = !state.notes;
    save();
    render();
  });
  window.addEventListener("hashchange", () => {
    render();
    window.scrollTo(0, 0);
    const h1 = $("#screen h1");
    if (h1) h1.focus({ preventScroll: true });
  });
  render();
})();
