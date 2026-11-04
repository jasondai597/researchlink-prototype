import { formatDate } from '../lib/dates'
import { RobotSpot } from './Art'
import { groupTasks, toICS, type Task } from '../lib/plan'
import type { Opportunity } from '../lib/types'

export function Plan({
  selected,
  tasks,
  done,
  today,
  onToggleDone,
  onBack,
}: {
  selected: Opportunity[]
  tasks: Task[]
  done: string[]
  today: Date
  onToggleDone: (id: string) => void
  onBack: () => void
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
          <p>Nothing in your plan yet. Add matches you want to apply to and your steps and deadlines show up here.</p>
          <button className="btn" type="button" onClick={onBack}>
            Back to my matches
          </button>
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
        <section className="first">
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
