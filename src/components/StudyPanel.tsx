import { useEffect, useState, useSyncExternalStore } from 'react'
import { STUDY_KEY, formatElapsed, readStudyLog, setParticipant, subscribeStudy, taskEnd, taskStart, toCSV } from '../lib/study'

// Snapshot as a string so useSyncExternalStore can compare it cheaply.
const snapshot = () => {
  try {
    return localStorage.getItem(STUDY_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Facilitator controls, shown only in study mode (?study=1). Nothing here leaves the browser. */
export function StudyPanel({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [status, setStatus] = useState('')
  useSyncExternalStore(subscribeStudy, snapshot)
  const log = readStudyLog()
  const start = taskStart(log.events)
  const end = taskEnd(log.events)

  useEffect(() => {
    if (!open || start === null || end !== null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [open, start, end])

  async function copy() {
    try {
      await navigator.clipboard.writeText(toCSV(log))
      setStatus(`Copied ${log.events.length} events as CSV`)
    } catch {
      setStatus('Copy failed. Check clipboard permissions.')
    }
  }

  function reset() {
    if (!window.confirm('Clear the event log and this participant’s answers?')) return
    onReset()
    setStatus('Session reset. Ready for the next participant.')
  }

  const elapsed = start === null ? 'Not started' : end !== null ? `${formatElapsed(end - start)} (done)` : formatElapsed(Math.max(now, start) - start)

  return (
    <div className="study">
      {open && (
        <section className="study-panel" aria-label="Usability study">
          <p className="study-title">Usability study</p>
          <label className="field">
            <span className="field-label">Participant ID</span>
            <input value={log.participant} onChange={(e) => setParticipant(e.target.value)} placeholder="e.g., P03" />
          </label>
          <p className="study-time">
            <span className="muted">Start to first calendar export</span>
            <span className="study-elapsed">{elapsed}</span>
          </p>
          <p className="muted">{log.events.length} events recorded in this browser</p>
          <div className="row">
            <button className="btn btn-secondary" type="button" onClick={copy}>
              Copy CSV
            </button>
            <button className="link" type="button" onClick={reset}>
              Reset session
            </button>
          </div>
          <p className="muted" role="status">
            {status}
          </p>
        </section>
      )}
      <button
        className="study-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => {
          setNow(Date.now())
          setOpen(!open)
        }}
      >
        Study
      </button>
    </div>
  )
}
