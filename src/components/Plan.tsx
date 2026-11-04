import { useState } from 'react'
import { formatDate } from '../lib/dates'
import { CHANNEL_LABELS, draftMessage, draftSubject, mailtoHref } from '../lib/outreach'
import { groupTasks, toICS, type Task } from '../lib/plan'
import type { ContactChannel, Opportunity, Profile } from '../lib/types'
import { RobotSpot } from './Art'

export function Plan({
  selected,
  tasks,
  done,
  today,
  profile,
  onToggleDone,
  onBack,
  onBrowse,
}: {
  selected: Opportunity[]
  tasks: Task[]
  done: string[]
  today: Date
  profile: Profile | null
  onToggleDone: (id: string) => void
  onBack: () => void
  onBrowse: () => void
}) {
  const titleFor = (id: string) => selected.find((o) => o.id === id)?.title ?? id
  const next = tasks.find((t) => !done.includes(t.id))
  const groups = groupTasks(tasks, today)

  function download() {
    const blob = new Blob([toICS(tasks, titleFor)], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'research-action-plan.ics'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (!selected.length) {
    return (
      <div className="plan">
        <h1>Your action plan</h1>
        <div className="empty">
          <RobotSpot pose="wave" className="empty-robot" />
          <p>Nothing in your plan yet. Add opportunities from your matches or the directory, and your steps and deadlines show up here.</p>
          <div className="row">
            <button className="btn btn-primary" type="button" onClick={onBack}>
              Get matched
            </button>
            <button className="btn" type="button" onClick={onBrowse}>
              Browse all opportunities
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="plan">
      <header className="plan-head">
        <div>
          <h1>Your action plan</h1>
          <p className="muted">
            {tasks.length} steps for {selected.length} application{selected.length === 1 ? '' : 's'} · {done.filter((d) => tasks.some((t) => t.id === d)).length} done ·{' '}
            <button className="link" type="button" onClick={onBack}>
              Change what's in my plan
            </button>
          </p>
        </div>
        <div className="plan-actions">
          <button className="btn" type="button" onClick={download}>
            Add to calendar (.ics)
          </button>
          <button className="btn" type="button" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </header>

      {next && (
        <section className="first on-navy">
          <RobotSpot pose="calendar" className="first-robot" />
          <p className="first-label">Do this first</p>
          <p className="first-title">{next.title}</p>
          <p>
            {next.late ? 'Today: the ideal date has already passed.' : `By ${formatDate(next.due)}.`} {next.detail}
          </p>
        </section>
      )}

      <section className="deadlines">
        <h2>Deadlines</h2>
        <ul>
          {selected
            .slice()
            .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
            .map((o) => (
              <li key={o.id}>
                <span className="dl-date">{o.deadline ? formatDate(o.deadline) : 'Rolling'}</span>
                <span>{o.title}</span>
              </li>
            ))}
        </ul>
      </section>

      <h2>Timeline</h2>
      <ol className="timeline">
        {groups.map((g) => (
          <li key={g.label} className="tl-group">
            <h3>{g.label}</h3>
            <ul>
              {g.tasks.map((t) => {
                const isDone = done.includes(t.id)
                return (
                  <li key={t.id} className={`task${isDone ? ' task-done' : ''}${t.late && !isDone ? ' task-late' : ''}`}>
                    <label>
                      <input type="checkbox" checked={isDone} onChange={() => onToggleDone(t.id)} />
                      <span className="task-body">
                        <span className="task-title">{t.title}</span>
                        <span className="task-due">
                          {formatDate(t.due)}
                          {t.late && !isDone ? ' · ideal date passed, do it now' : ''}
                        </span>
                        <span className="task-detail">{t.detail}</span>
                        <span className="task-for">For: {t.forIds.map(titleFor).join('; ')}</span>
                      </span>
                    </label>
                    {t.outreach && <Outreach o={selected.find((o) => o.id === t.outreach)!} profile={profile} />}
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}

const CHANNELS: ContactChannel[] = ['chat', 'office-hours', 'email']
const CHANNEL_HOW: Record<ContactChannel, string> = {
  chat: 'Ask for 10 minutes to learn what the first weeks involve. Lowest pressure for both sides.',
  'office-hours': 'Bring two specific questions. No appointment needed.',
  email: 'Keep it under 120 words with one clear question. Follow up once after five working days.',
}

function Outreach({ o, profile }: { o: Opportunity; profile: Profile | null }) {
  const [copied, setCopied] = useState(false)
  const c = o.contact!
  const text = draftMessage(o, profile)
  const mailto = mailtoHref(o, profile)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${draftSubject(o)}\n\n${text}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <details className="outreach">
      <summary>Ways to reach out, with a message draft</summary>
      <div className="outreach-body">
        <p className="outreach-who">
          <b>{c.name}</b>, {c.role}
          {c.when ? ` · ${c.when}` : ''}
        </p>
        <ul className="outreach-ways">
          {[c.channel, ...CHANNELS.filter((ch) => ch !== c.channel && c.email !== null && ch !== 'office-hours')].map((ch) => (
            <li key={ch} className={ch === c.channel ? 'way way-preferred' : 'way'}>
              <span className="way-name">
                {CHANNEL_LABELS[ch]}
                {ch === c.channel && <span className="way-tag">They prefer this</span>}
              </span>
              <span className="way-how">{CHANNEL_HOW[ch]}</span>
            </li>
          ))}
        </ul>
        <label className="field">
          Message draft{profile ? '' : ' (fill in the [brackets], or complete your profile first)'}
          <textarea readOnly rows={9} value={`Subject: ${draftSubject(o)}\n\n${text}`} />
        </label>
        <div className="row">
          <button className="btn" type="button" onClick={copy}>
            {copied ? 'Copied' : 'Copy message'}
          </button>
          {mailto && (
            <a className="btn" href={mailto}>
              Open in email app
            </a>
          )}
          <span role="status" className="sr-only">
            {copied ? 'Message copied' : ''}
          </span>
        </div>
      </div>
    </details>
  )
}
