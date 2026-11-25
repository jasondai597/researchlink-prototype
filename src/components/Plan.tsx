import { useRef, useState } from 'react'
import { formatDate } from '../lib/dates'
import { CHANNEL_LABELS, draftMessage, draftSubject, mailtoHref } from '../lib/outreach'
import { ICS_FILENAME, googleCalendarUrl, groupTasks, tasksFor, toICS, type Task } from '../lib/plan'
import { logStudy } from '../lib/study'
import type { ContactChannel, Opportunity, Profile } from '../lib/types'

const ALL = 'all'
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function downloadICS(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = ICS_FILENAME
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Some browsers start the download asynchronously; don't pull the file out from under them.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function Plan({
  selected,
  tasks,
  done,
  calendared,
  today,
  profile,
  onToggleDone,
  onExported,
  onBack,
  onBrowse,
}: {
  selected: Opportunity[]
  tasks: Task[]
  done: string[]
  calendared: string[]
  today: Date
  profile: Profile | null
  onToggleDone: (id: string) => void
  onExported: (ids: string[]) => void
  onBack: () => void
  onBrowse: () => void
}) {
  // One confirmation at a time, shown in the live region next to the button that made it.
  const [notice, setNotice] = useState<{ key: string; text: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const titleFor = (id: string) => selected.find((o) => o.id === id)?.title ?? id
  const next = tasks.find((t) => !done.includes(t.id))
  const groups = groupTasks(tasks, today)

  function exportTasks(key: string, list: Task[], label: string, ids: string[]) {
    downloadICS(toICS(list, titleFor))
    logStudy('calendar_export', key)
    onExported(ids)
    const text = `✓ ${plural(list.length, 'step')} for ${label} saved to ${ICS_FILENAME}. Open the file to add them to Apple Calendar or Outlook; in Google Calendar use Settings › Import.`
    // Clear first so a repeat export is announced again.
    setNotice(null)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNotice({ key, text }), 50)
  }

  const noticeFor = (key: string) => (notice?.key === key ? notice.text : '')

  if (!selected.length) {
    return (
      <div className="plan page">
        <header className="page-head">
          <h1>Your action plan</h1>
        </header>
        <div className="empty">
          <p>Nothing in your plan yet. Add opportunities from your matches or the directory, and your steps and deadlines show up here.</p>
          <div className="row">
            <button className="btn btn-primary" type="button" onClick={onBack}>
              Get matched
            </button>
            <button className="link" type="button" onClick={onBrowse}>
              Browse all opportunities ›
            </button>
          </div>
        </div>
      </div>
    )
  }

  const doneCount = done.filter((d) => tasks.some((t) => t.id === d)).length

  return (
    <div className="plan page">
      <header className="page-head plan-head">
        <div>
          <h1>Your action plan</h1>
          <p className="page-sub">
            {plural(tasks.length, 'step')} for {plural(selected.length, 'application')} · {doneCount} done ·{' '}
            <button className="link" type="button" onClick={onBack}>
              Change what's in my plan ›
            </button>
          </p>
        </div>
        <div className="plan-actions">
          <div className="row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => exportTasks(ALL, tasks, plural(selected.length, 'application'), selected.map((o) => o.id))}
            >
              Add all to calendar
            </button>
            <button className="link" type="button" onClick={() => window.print()}>
              Print ›
            </button>
          </div>
          <p className="cal-notice" role="status" aria-live="polite">
            {noticeFor(ALL)}
          </p>
        </div>
      </header>

      {next && (
        <section className="first" aria-labelledby="first-title">
          <p className="first-label">Do this first</p>
          <p className="first-title" id="first-title">
            {next.title}
          </p>
          <p>
            {next.late ? 'Today: the ideal date has already passed.' : `By ${formatDate(next.due)}.`} {next.detail}
          </p>
        </section>
      )}

      <section className="deadlines" aria-labelledby="deadlines-h">
        <h2 id="deadlines-h">Deadlines</h2>
        <p className="section-sub">Add one application's steps at a time, or use “Add all to calendar” above.</p>
        <ul className="rows">
          {selected
            .slice()
            .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
            .map((o) => {
              const mine = tasksFor(tasks, o.id)
              const inCal = calendared.includes(o.id)
              return (
                <li key={o.id} className="dl-row">
                  <span className="dl-date">{o.deadline ? formatDate(o.deadline) : 'Rolling'}</span>
                  <span className="dl-main">
                    <span className="dl-title">{o.title}</span>
                    <span className="dl-meta">
                      {plural(mine.length, 'step')}
                      {inCal && <span className="dl-status"> · ✓ In your calendar</span>}
                    </span>
                  </span>
                  <button className="btn btn-secondary dl-btn" type="button" onClick={() => exportTasks(o.id, mine, o.title, [o.id])}>
                    {inCal ? 'Add again' : 'Add to calendar'}
                    <span className="sr-only">: {o.title}</span>
                  </button>
                  <p className="cal-notice dl-notice" role="status" aria-live="polite">
                    {noticeFor(o.id)}
                  </p>
                </li>
              )
            })}
        </ul>
      </section>

      <section aria-labelledby="timeline-h">
        <h2 id="timeline-h">Timeline</h2>
        <ol className="timeline">
          {groups.map((g) => (
            <li key={g.label} className="tl-group">
              <h3>{g.label}</h3>
              <ul>
                {g.tasks.map((t) => {
                  const isDone = done.includes(t.id)
                  return (
                    <li key={t.id} className={`task${isDone ? ' task-done' : ''}${t.late && !isDone ? ' task-late' : ''}`}>
                      <label className="task-check">
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
                      <p className="task-links">
                        <a
                          className="link"
                          href={googleCalendarUrl(t, titleFor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => logStudy('google_calendar_click', t.id)}
                        >
                          Google Calendar ›<span className="sr-only">: add “{t.title}” (opens in a new tab)</span>
                        </a>
                      </p>
                      {t.outreach && <Outreach o={selected.find((o) => o.id === t.outreach)!} profile={profile} />}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>
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
          <span className="field-label">Message draft{profile ? '' : ' (fill in the [brackets], or complete your profile first)'}</span>
          <textarea readOnly rows={9} value={`Subject: ${draftSubject(o)}\n\n${text}`} />
        </label>
        <div className="row">
          <button className="btn btn-secondary" type="button" onClick={copy}>
            {copied ? 'Copied' : 'Copy message'}
          </button>
          {mailto && (
            <a className="link" href={mailto}>
              Open in email app ›
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
