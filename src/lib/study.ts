/**
 * Usability-study mode, for facilitated sessions only. It is off unless the page is
 * opened with ?study=1, and then stays on for that browser tab (sessionStorage).
 * Events are kept in this browser's localStorage and are never sent anywhere; the
 * facilitator copies them out as CSV.
 */

export const STUDY_KEY = 'researchlink-study'
const SESSION_FLAG = 'researchlink-study-mode'

export type StudyEventName =
  | 'start_click'
  | 'first_input'
  | 'submit_attempt'
  | 'results_view'
  | 'add_to_plan'
  | 'remove_from_plan'
  | 'plan_view'
  | 'calendar_export'
  | 'google_calendar_click'
  | 'route'
  | 'edit_click'
  | 'back_click'

export interface StudyEvent {
  event: StudyEventName
  at: string // ISO time
  detail: string
}

export interface StudyLog {
  participant: string
  events: StudyEvent[]
}

const EMPTY_LOG: StudyLog = { participant: '', events: [] }

/** ?study=1 turns it on for the tab, ?study=0 turns it off, otherwise keep what the tab had. */
export function studyFlag(search: string, sessionValue: string | null): boolean {
  const q = new URLSearchParams(search).get('study')
  if (q === '1') return true
  if (q === '0') return false
  return sessionValue === '1'
}

let enabled = false
const listeners = new Set<() => void>()

export function initStudyMode(): boolean {
  try {
    enabled = studyFlag(location.search, sessionStorage.getItem(SESSION_FLAG))
    if (enabled) sessionStorage.setItem(SESSION_FLAG, '1')
    else sessionStorage.removeItem(SESSION_FLAG)
  } catch {
    enabled = false
  }
  return enabled
}

export function readStudyLog(): StudyLog {
  try {
    const raw = localStorage.getItem(STUDY_KEY)
    if (!raw) return EMPTY_LOG
    const data = JSON.parse(raw) as Partial<StudyLog>
    return { participant: typeof data.participant === 'string' ? data.participant : '', events: Array.isArray(data.events) ? data.events : [] }
  } catch {
    return EMPTY_LOG
  }
}

function write(log: StudyLog) {
  try {
    localStorage.setItem(STUDY_KEY, JSON.stringify(log))
  } catch {
    /* storage blocked: nothing to record */
  }
  listeners.forEach((f) => f())
}

/** Record an event. Does nothing outside study mode. */
export function logStudy(event: StudyEventName, detail = '', now: Date = new Date()) {
  if (!enabled) return
  const log = readStudyLog()
  write({ ...log, events: [...log.events, { event, at: now.toISOString(), detail }] })
}

/** Record an event only the first time it happens in this session (e.g. first_input). */
export function logStudyOnce(event: StudyEventName, detail = '') {
  if (!enabled) return
  if (readStudyLog().events.some((e) => e.event === event)) return
  logStudy(event, detail)
}

export function setParticipant(participant: string) {
  write({ ...readStudyLog(), participant })
}

export function clearStudyLog() {
  try {
    localStorage.removeItem(STUDY_KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((f) => f())
}

export function subscribeStudy(f: () => void): () => void {
  listeners.add(f)
  return () => listeners.delete(f)
}

// ------------------------------------------------------------------ analysis (pure)

const time = (e: StudyEvent) => Date.parse(e.at)

/** Task start: the earlier of the first start_click and the first form input. */
export function taskStart(events: StudyEvent[]): number | null {
  const starts = events.filter((e) => e.event === 'start_click' || e.event === 'first_input').map(time)
  return starts.length ? Math.min(...starts) : null
}

/** Task end: the first calendar export at or after the start. */
export function taskEnd(events: StudyEvent[]): number | null {
  const start = taskStart(events)
  if (start === null) return null
  const ends = events.filter((e) => e.event === 'calendar_export').map(time).filter((t) => t >= start)
  return ends.length ? Math.min(...ends) : null
}

export function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const csvCell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

/** One row per event: participant, event, ISO time, ms since task start (blank before it starts), detail. */
export function toCSV(log: StudyLog): string {
  const start = taskStart(log.events)
  const rows = [['participant', 'event', 'time', 'ms_since_start', 'detail']]
  for (const e of log.events) {
    rows.push([log.participant, e.event, e.at, start === null ? '' : String(time(e) - start), e.detail])
  }
  return rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n'
}
