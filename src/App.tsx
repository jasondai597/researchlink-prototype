import { useMemo, useState } from 'react'
import { BrandMark, HeroArt, RobotSpot } from './components/Art'
import { Intake } from './components/Intake'
import { Plan } from './components/Plan'
import { Results } from './components/Results'
import { sampleOpportunities } from './data/opportunities'
import { match } from './lib/match'
import { buildPlan } from './lib/plan'
import { useHashRoute, useSaved } from './lib/store'

export default function App() {
  const [today] = useState(() => new Date())
  const opportunities = useMemo(() => sampleOpportunities(today), [today])
  const { saved, update, reset } = useSaved()
  const [route, go] = useHashRoute()
  const [matching, setMatching] = useState(false)

  const matched = useMemo(() => (saved.profile ? match(opportunities, saved.profile, today) : null), [opportunities, saved.profile, today])
  const selectedOps = useMemo(
    () => opportunities.filter((o) => saved.selected.includes(o.id) && matched?.results.some((r) => r.opportunity.id === o.id)),
    [opportunities, saved.selected, matched],
  )
  const tasks = useMemo(() => buildPlan(selectedOps, today), [selectedOps, today])

  const page = !saved.profile ? 'intake' : route === 'results' || route === 'plan' ? route : route === 'start' ? 'intake' : 'results'

  return (
    <>
      <header className="topbar on-navy">
        <a className="brand" href="#/start">
          <BrandMark />
          ResearchLink
        </a>
        <nav aria-label="Steps" className="steps">
          <a href="#/start" aria-current={page === 'intake' ? 'step' : undefined}>
            1 · Your profile
          </a>
          <a href="#/results" aria-current={page === 'results' ? 'step' : undefined} aria-disabled={!saved.profile}>
            2 · Matches
          </a>
          <a href="#/plan" aria-current={page === 'plan' ? 'step' : undefined} aria-disabled={!saved.profile}>
            3 · Action plan
          </a>
        </nav>
      </header>
      <p className="sample-banner on-navy">Prototype: every program, lab and deadline here is a made-up sample.</p>

      {matching && (
        <div className="matching on-navy" role="status" aria-live="polite">
          <RobotSpot pose="search" className="matching-robot" />
          <p className="matching-title">Checking {opportunities.length} opportunities against your profile</p>
          <p className="muted">Skills, interests, time and deadlines</p>
        </div>
      )}

      {page === 'intake' && (
        <section className="hero-band on-navy">
          <div className="hero-inner">
            <p className="hero-place">Made in Toronto for U of T undergrads</p>
            <h1>Where could you do research?</h1>
            <p className="lede">
              Answer a few questions and we'll match you to research programs and projects you can actually apply to,
              explain why each one fits, and turn the deadlines into a step-by-step plan.
            </p>
            <p className="privacy">About 2 minutes. Your answers stay in this browser; nothing is sent anywhere.</p>
            <HeroArt />
          </div>
        </section>
      )}

      <main className={`main main-${page}`}>
        {page === 'intake' && (
          <Intake
            initial={saved.profile}
            onSubmit={(profile) => {
              update({ profile })
              // One short "matching" moment, skipped for people who prefer reduced motion.
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
            onToggle={(id) =>
              update({ selected: saved.selected.includes(id) ? saved.selected.filter((x) => x !== id) : [...saved.selected, id] })
            }
            onEdit={() => go('start')}
            onPlan={() => go('plan')}
          />
        )}
        {page === 'plan' && (
          <Plan
            selected={selectedOps}
            tasks={tasks}
            done={saved.done}
            today={today}
            onToggleDone={(id) => update({ done: saved.done.includes(id) ? saved.done.filter((x) => x !== id) : [...saved.done, id] })}
            onBack={() => go('results')}
          />
        )}
      </main>

      <footer className="foot">
        <span>Made in Toronto by U of T students. Not affiliated with or endorsed by the University of Toronto.</span>
        <button
          className="link"
          type="button"
          onClick={() => {
            reset()
            go('start')
          }}
        >
          Clear my answers
        </button>
      </footer>
    </>
  )
}
