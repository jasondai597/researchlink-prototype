import { useEffect, useMemo, useRef, useState } from 'react'
import { Browse } from './components/Browse'
import { NodeIcon } from './components/Icon'
import { Intake } from './components/Intake'
import { Plan } from './components/Plan'
import { Results } from './components/Results'
import { StudyPanel } from './components/StudyPanel'
import { sampleOpportunities } from './data/opportunities'
import { PHOTO_ALT, PHOTO_CREDIT } from './data/site'
import { hiddenReason } from './lib/directory'
import { match } from './lib/match'
import { buildPlan } from './lib/plan'
import { useHashRoute, useSaved } from './lib/store'
import { clearStudyLog, initStudyMode, logStudy } from './lib/study'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [today] = useState(() => new Date())
  const [study] = useState(initStudyMode)
  const opportunities = useMemo(() => sampleOpportunities(today), [today])
  const { saved, update, reset } = useSaved()
  const [route, go] = useHashRoute()
  const [matching, setMatching] = useState(false)
  const [formKey, setFormKey] = useState(0) // remounts the form after "Clear my answers"
  const [photoMissing, setPhotoMissing] = useState(false)

  const matched = useMemo(() => (saved.profile ? match(opportunities, saved.profile, today) : null), [opportunities, saved.profile, today])
  // Anything added from matches or the directory, as long as it's still listed.
  const selectedOps = useMemo(
    () => opportunities.filter((o) => saved.selected.includes(o.id) && hiddenReason(o, today) === null),
    [opportunities, saved.selected, today],
  )
  const tasks = useMemo(() => buildPlan(selectedOps, today), [selectedOps, today])

  function toggleSelected(id: string) {
    if (saved.selected.includes(id)) {
      logStudy('remove_from_plan', id)
      update({ selected: saved.selected.filter((x) => x !== id), calendared: saved.calendared.filter((x) => x !== id) })
    } else {
      logStudy('add_to_plan', id)
      update({ selected: [...saved.selected, id] })
    }
  }

  function clearAnswers() {
    reset()
    setFormKey((k) => k + 1)
    go('start')
  }

  function startQuestions() {
    logStudy('start_click')
    const heading = document.getElementById('step-1')
    if (!heading) return
    heading.closest('section')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
    heading.focus({ preventScroll: true })
  }

  const page =
    route === 'browse' || route === 'plan'
      ? route
      : route === 'start' || !saved.profile
        ? 'intake'
        : 'results'

  // Study mode: one event per page change (StrictMode runs effects twice; the ref keeps it to one).
  const lastPage = useRef<string | null>(null)
  useEffect(() => {
    if (lastPage.current === page) return
    lastPage.current = page
    logStudy('route', page)
    if (page === 'results') logStudy('results_view')
    if (page === 'plan') logStudy('plan_view')
  }, [page])

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#/start">
            <NodeIcon />
            ResearchLink
          </a>
          <nav aria-label="Main" className="tabs">
            <a href="#/start" aria-current={page === 'intake' ? 'page' : undefined}>
              Get matched
            </a>
            <a
              href="#/results"
              aria-current={page === 'results' ? 'page' : undefined}
              aria-disabled={saved.profile ? undefined : true}
              onClick={(e) => {
                if (!saved.profile) e.preventDefault()
              }}
            >
              Matches
            </a>
            <a href="#/browse" aria-current={page === 'browse' ? 'page' : undefined}>
              Browse all
            </a>
            <a href="#/plan" aria-current={page === 'plan' ? 'page' : undefined}>
              Action plan{saved.selected.length ? ` (${selectedOps.length})` : ''}
            </a>
          </nav>
        </div>
      </header>
      <p className="sample-banner">Prototype: every program, lab and deadline here is a made-up sample.</p>

      {matching && (
        <div className="matching" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p className="matching-title">Checking {opportunities.length} opportunities against your profile</p>
          <p className="muted">Skills, interests, time and deadlines</p>
        </div>
      )}

      {page === 'intake' && (
        <>
          <section className="hero" aria-labelledby="hero-title">
            <p className="hero-place">Made in Toronto for U of T undergrads</p>
            <h1 id="hero-title">Where could you do research?</h1>
            <p className="hero-sub">
              Answer a few questions. We'll match you to programs and projects you can actually apply to, explain why each
              fits, and turn the deadlines into a plan for your calendar.
            </p>
            <button className="btn btn-primary hero-cta" type="button" onClick={startQuestions}>
              Start the questions <span aria-hidden="true">↓</span>
            </button>
            <p className="hero-note">About 2 minutes. Your answers stay in this browser.</p>
          </section>
          <div className="campus-wrap">
            {photoMissing ? (
              <div className="campus campus-missing" role="img" aria-label={PHOTO_ALT} />
            ) : (
              <img
                className="campus"
                src={`${import.meta.env.BASE_URL}campus.jpg`}
                alt={PHOTO_ALT}
                width={1240}
                height={520}
                decoding="async"
                onError={() => setPhotoMissing(true)}
              />
            )}
          </div>
        </>
      )}

      <main className={`main main-${page}`}>
        {page === 'intake' && (
          <Intake
            key={formKey}
            initial={saved.profile}
            onSubmit={(profile) => {
              update({ profile })
              // One short "matching" moment, skipped for people who prefer reduced motion.
              if (reducedMotion()) {
                go('results')
                return
              }
              setMatching(true)
              window.setTimeout(() => {
                setMatching(false)
                go('results')
              }, 1100)
            }}
          />
        )}
        {page === 'results' && matched && saved.profile && (
          <Results
            profile={saved.profile}
            results={matched.results}
            excluded={matched.excluded}
            selected={saved.selected}
            onToggle={toggleSelected}
            onEdit={() => {
              logStudy('edit_click')
              go('start')
            }}
            onPlan={() => go('plan')}
          />
        )}
        {page === 'browse' && (
          <Browse opportunities={opportunities} today={today} selected={saved.selected} onToggle={toggleSelected} onMatch={() => go('start')} />
        )}
        {page === 'plan' && (
          <Plan
            selected={selectedOps}
            tasks={tasks}
            done={saved.done}
            calendared={saved.calendared}
            today={today}
            profile={saved.profile}
            onToggleDone={(id) => update({ done: saved.done.includes(id) ? saved.done.filter((x) => x !== id) : [...saved.done, id] })}
            onExported={(ids) => update({ calendared: [...new Set([...saved.calendared, ...ids])] })}
            onBack={() => {
              logStudy('back_click')
              go(saved.profile ? 'results' : 'start')
            }}
            onBrowse={() => go('browse')}
          />
        )}
      </main>

      <footer className="foot">
        <div className="foot-inner">
          <p>Made in Toronto by U of T students. Not affiliated with or endorsed by the University of Toronto.</p>
          <p>Campus photo: {PHOTO_CREDIT}</p>
          <button className="link" type="button" onClick={clearAnswers}>
            Clear my answers
          </button>
        </div>
      </footer>

      {study && (
        <StudyPanel
          onReset={() => {
            clearStudyLog()
            clearAnswers()
          }}
        />
      )}
    </>
  )
}
