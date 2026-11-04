import { useMemo, useState } from 'react'
import { AREAS, COMP_LABELS, TERM_LABELS } from '../data/catalog'
import { daysBetween, formatDate, parseDate } from '../lib/dates'
import { FRESH_WITHIN_DAYS, NO_FILTERS, STALE_AFTER_DAYS, browse, daysSinceVerified, type DirectoryFilters } from '../lib/directory'
import type { Compensation, Opportunity, Term } from '../lib/types'

function verifiedText(days: number) {
  if (days === 0) return 'Verified today'
  if (days === 1) return 'Verified yesterday'
  return `Verified ${days} days ago`
}

export function Browse({
  opportunities,
  today,
  selected,
  onToggle,
  onMatch,
}: {
  opportunities: Opportunity[]
  today: Date
  selected: string[]
  onToggle: (id: string) => void
  onMatch: () => void
}) {
  const [f, setF] = useState<DirectoryFilters>(NO_FILTERS)
  const set = (patch: Partial<DirectoryFilters>) => setF((x) => ({ ...x, ...patch }))
  const { list, hidden, total } = useMemo(() => browse(opportunities, f, today), [opportunities, f, today])
  const filtering = f.q || f.kind || f.area || f.compensation || f.term
  const hiddenCount = hidden['past-deadline'] + hidden.stale

  return (
    <div className="directory">
      <header className="dir-head">
        <h1>All open opportunities</h1>
        <p className="lede-sm">
          Every program and project we list, in one place. Each one shows when it was last checked against its source.
          Anything past its deadline or not checked in {STALE_AFTER_DAYS} days is taken down automatically.
        </p>
        <p className="muted">
          Not sure what fits?{' '}
          <button className="link" type="button" onClick={onMatch}>
            Get matched instead
          </button>
        </p>
      </header>

      <form className="dir-filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="field dir-search">
          Search
          <input type="search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Skill, topic, lab or keyword" />
        </label>
        <label className="field">
          Type
          <select value={f.kind} onChange={(e) => set({ kind: e.target.value as DirectoryFilters['kind'] })}>
            <option value="">All</option>
            <option value="program">Programs</option>
            <option value="project">Projects</option>
          </select>
        </label>
        <label className="field">
          Area
          <select value={f.area} onChange={(e) => set({ area: e.target.value })}>
            <option value="">All areas</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Compensation
          <select value={f.compensation} onChange={(e) => set({ compensation: e.target.value as '' | Compensation })}>
            <option value="">Any</option>
            {(Object.keys(COMP_LABELS) as Compensation[]).map((c) => (
              <option key={c} value={c}>
                {COMP_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Term
          <select value={f.term} onChange={(e) => set({ term: e.target.value as '' | Term })}>
            <option value="">Any</option>
            {(Object.keys(TERM_LABELS) as Term[]).map((t) => (
              <option key={t} value={t}>
                {TERM_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Sort
          <select value={f.sort} onChange={(e) => set({ sort: e.target.value as DirectoryFilters['sort'] })}>
            <option value="verified">Recently verified</option>
            <option value="deadline">Deadline soonest</option>
          </select>
        </label>
      </form>

      <p className="dir-count" aria-live="polite">
        {list.length} of {total} open {total === 1 ? 'listing' : 'listings'}
        {filtering ? ' match your filters' : ''}
        {hiddenCount > 0 &&
          ` · ${hiddenCount} taken down (${[
            hidden['past-deadline'] ? `${hidden['past-deadline']} past deadline` : '',
            hidden.stale ? `${hidden.stale} not re-verified` : '',
          ]
            .filter(Boolean)
            .join(', ')})`}
        {filtering && (
          <>
            {' · '}
            <button className="link" type="button" onClick={() => setF(NO_FILTERS)}>
              Clear filters
            </button>
          </>
        )}
      </p>

      {list.length ? (
        <ul className="dir-list">
          {list.map((o) => {
            const v = daysSinceVerified(o, today)
            const d = o.deadline ? daysBetween(today, parseDate(o.deadline)) : null
            const added = selected.includes(o.id)
            return (
              <li key={o.id} className="dir-row">
                <div className="dir-main">
                  <p className="kind">
                    {o.kind === 'program' ? 'Program' : 'Project'} · {o.org}
                  </p>
                  <h2 className="dir-title">{o.title}</h2>
                  <p className="dir-summary">{o.summary}</p>
                  <p className="dir-facts">
                    {COMP_LABELS[o.compensation]} · {o.terms.length === 1 && o.terms[0] === 'summer' ? 'Full-time' : `${o.hoursPerWeek} h/week`} ·{' '}
                    {o.terms.map((t) => TERM_LABELS[t]).join(', ')} · {o.maxYear ? `Years ${o.minYear}–${o.maxYear}` : `From year ${o.minYear}`}
                    {o.contact ? ` · Contact: ${o.contact.name}, ${o.contact.role}` : ''}
                  </p>
                </div>
                <div className="dir-side">
                  <p className={`fresh ${v <= FRESH_WITHIN_DAYS ? 'fresh-new' : 'fresh-ok'}`}>
                    <span className="fresh-dot" aria-hidden="true" />
                    {verifiedText(v)}
                  </p>
                  <p className={`dir-deadline${d !== null && d <= 14 ? ' deadline-soon' : ''}`}>
                    {o.deadline ? `Closes ${formatDate(o.deadline)}` : 'Rolling'}
                  </p>
                  <label className={`add${added ? ' add-on' : ''}`}>
                    <input type="checkbox" checked={added} onChange={() => onToggle(o.id)} />
                    <span>{added ? 'Added to plan' : 'Add to my plan'}</span>
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="empty">
          <p>No open listings match those filters.</p>
          <button className="btn" type="button" onClick={() => setF(NO_FILTERS)}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
