import { AREAS, COMP_LABELS, DOC_LABELS } from '../data/catalog'
import { formatDate } from '../lib/dates'
import { groupOf } from '../lib/match'
import type { Band, Excluded, MatchResult, Profile } from '../lib/types'

const BAND_LABEL: Record<Band, string> = { strong: 'Strong match', possible: 'Worth a try', stretch: 'Stretch' }

const GROUPS = [
  { key: 'now', title: 'Apply now', sub: 'Good matches with a deadline in the next 6 weeks, or rolling.' },
  { key: 'later', title: 'Plan ahead', sub: 'Good matches with later deadlines. Start preparing early.' },
  { key: 'stretch', title: 'Stretch picks', sub: 'A few gaps, but often worth asking about.' },
] as const

function deadlineText(r: MatchResult) {
  const o = r.opportunity
  if (!o.deadline) return 'Rolling: apply any time'
  const d = r.daysToDeadline ?? 0
  return `Closes ${formatDate(o.deadline)} · ${d === 0 ? 'today' : `in ${d} day${d === 1 ? '' : 's'}`}`
}

function BandTag({ band }: { band: Band }) {
  return (
    <span className={`band band-${band}`}>
      <span className="dot" aria-hidden="true" />
      {BAND_LABEL[band]}
    </span>
  )
}

export function Results({
  profile,
  results,
  excluded,
  selected,
  onToggle,
  onEdit,
  onPlan,
}: {
  profile: Profile
  results: MatchResult[]
  excluded: Excluded[]
  selected: string[]
  onToggle: (id: string) => void
  onEdit: () => void
  onPlan: () => void
}) {
  const areas = profile.interests.map((id) => AREAS.find((a) => a.id === id)?.label).filter(Boolean)
  return (
    <div className="results page">
      <header className="page-head">
        <h1>Your matches</h1>
        <p className="page-sub">
          Year {profile.year}
          {profile.program ? `, ${profile.program}` : ''} · {profile.hoursPerWeek} h/week
          {areas.length ? ` · ${areas.join(', ')}` : ''}
          {profile.wantToLearn.length ? ` · Want to learn: ${profile.wantToLearn.join(', ')}` : ''} ·{' '}
          <button className="link" type="button" onClick={onEdit}>
            Edit answers ›
          </button>
        </p>
        <p className="how">
          We filter out what you can't apply to, then rank the rest by skills (40%), interests (30%), time (20%) and
          experience (10%). Bands are a guide, not your odds.
        </p>
      </header>

      {GROUPS.map((g) => {
        const list = results.filter((r) => groupOf(r) === g.key)
        if (!list.length) return null
        return (
          <section key={g.key} className="group-section">
            <h2>{g.title}</h2>
            <p className="section-sub">{g.sub}</p>
            <ul className="cards">
              {list.map((r) => (
                <MatchCard key={r.opportunity.id} r={r} checked={selected.includes(r.opportunity.id)} onToggle={onToggle} />
              ))}
            </ul>
          </section>
        )
      })}

      {excluded.length > 0 && (
        <details className="excluded">
          <summary>{excluded.length} hidden because you can't apply right now</summary>
          <ul>
            {excluded.map((e) => (
              <li key={e.opportunity.id}>
                <b>{e.opportunity.title}</b>: {e.why}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="plan-bar">
        <p>
          {selected.length
            ? `${selected.length} added to your plan`
            : 'Add the ones you want to apply to, and we’ll turn their deadlines into a plan.'}
        </p>
        <button className="btn btn-primary" type="button" disabled={!selected.length} onClick={onPlan}>
          Build my action plan
        </button>
      </div>
    </div>
  )
}

function MatchCard({ r, checked, onToggle }: { r: MatchResult; checked: boolean; onToggle: (id: string) => void }) {
  const o = r.opportunity
  const soon = r.daysToDeadline !== null && r.daysToDeadline <= 14
  return (
    <li className="card match">
      <div className="match-top">
        <div>
          <p className="kind">
            {o.kind === 'program' ? 'Program' : 'Project'} · {o.org} · {COMP_LABELS[o.compensation]}
          </p>
          <h3>{o.title}</h3>
        </div>
        <BandTag band={r.band} />
      </div>
      <p className="summary">{o.summary}</p>
      <p className={`deadline${soon ? ' deadline-soon' : ''}`}>{deadlineText(r)}</p>

      <div className="ledger">
        <ul className="fits" aria-label="Why it fits">
          {r.reasons.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {r.gaps.length > 0 && (
          <ul className="gaps" aria-label="Gaps">
            {r.gaps.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="match-foot">
        <p className="docs">
          <span className="muted">You'll need:</span> {o.documents.map((d) => DOC_LABELS[d]).join(', ')}
        </p>
        <label className={`add${checked ? ' add-on' : ''}`}>
          <input className="vh" type="checkbox" checked={checked} onChange={() => onToggle(o.id)} />
          <span>{checked ? 'Added to plan' : 'Add to my plan'}</span>
        </label>
      </div>
    </li>
  )
}
