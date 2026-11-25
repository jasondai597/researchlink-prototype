import { addDays, daysBetween, iso, parseDate } from './dates'
import { outreachTitle } from './outreach'
import type { DocumentType, Opportunity } from './types'

export interface Task {
  id: string
  title: string
  detail: string
  due: string // YYYY-MM-DD
  forIds: string[]
  late: boolean // the ideal date has already passed
  outreach?: string // opportunity id: this step is an informal first contact
}

/** Days before the deadline each step should be done. */
const STEPS: Record<DocumentType, { days: number; title: string; detail: string; shared: boolean }> = {
  supervisor: {
    days: 35,
    title: 'Contact potential supervisors',
    detail: 'Ask for a short chat. Mention one paper or project of theirs and your availability.',
    shared: false,
  },
  reference: {
    days: 28,
    title: 'Ask a referee for a reference letter',
    detail: 'Give them at least 3 weeks, your CV, and the deadlines for every application it covers.',
    shared: true,
  },
  cv: {
    days: 14,
    title: 'Update your CV',
    detail: 'One page. Put relevant courses, projects and skills first.',
    shared: true,
  },
  transcript: {
    days: 10,
    title: 'Download your transcript',
    detail: 'An unofficial copy is usually fine at this stage; check each application.',
    shared: true,
  },
  statement: {
    days: 10,
    title: 'Draft your statement of interest',
    detail: 'Say why this project, what you bring, and what you want to learn. Get one person to read it.',
    shared: false,
  },
  form: {
    days: 3,
    title: 'Fill in the application form',
    detail: 'Save a copy of your answers before you submit.',
    shared: false,
  },
}

export const ROLLING_DAYS = 14 // treat rolling deadlines as "apply within two weeks"
/** Reach out informally three weeks before a deadline; for rolling listings, within two days. */
export const OUTREACH_DAYS = 21
export const OUTREACH_ROLLING_DAYS = 2

const OUTREACH_DETAIL =
  'A short, specific message lets you check fit and timing before you apply, and puts your name in front of the person who decides.'

export function buildPlan(selected: Opportunity[], today: Date): Task[] {
  const shared = new Map<DocumentType, Task>()
  const tasks: Task[] = []

  const schedule = (deadline: Date, daysBefore: number) => {
    const ideal = addDays(deadline, -daysBefore)
    const late = daysBetween(today, ideal) < 0
    return { due: iso(late ? today : ideal), late }
  }

  for (const o of selected) {
    const deadline = o.deadline ? parseDate(o.deadline) : addDays(today, ROLLING_DAYS)
    if (o.contact) {
      const when = o.deadline ? schedule(deadline, OUTREACH_DAYS) : { due: iso(addDays(today, OUTREACH_ROLLING_DAYS)), late: false }
      tasks.push({ id: `${o.id}-outreach`, title: outreachTitle(o), detail: OUTREACH_DETAIL, due: when.due, forIds: [o.id], late: when.late, outreach: o.id })
    }
    for (const doc of o.documents) {
      const step = STEPS[doc]
      const { due, late } = schedule(deadline, step.days)
      if (step.shared) {
        const existing = shared.get(doc)
        if (existing) {
          existing.forIds.push(o.id)
          if (due < existing.due) {
            existing.due = due
            existing.late = late
          }
          continue
        }
        const t: Task = { id: `shared-${doc}`, title: step.title, detail: step.detail, due, forIds: [o.id], late }
        shared.set(doc, t)
        tasks.push(t)
      } else {
        tasks.push({ id: `${o.id}-${doc}`, title: step.title, detail: step.detail, due, forIds: [o.id], late })
      }
    }
    const submit = schedule(deadline, 2)
    tasks.push({
      id: `${o.id}-submit`,
      title: o.deadline ? 'Submit your application' : 'Apply (rolling, so sooner is better)',
      detail: o.applyMethod,
      due: submit.due,
      forIds: [o.id],
      late: submit.late,
    })
  }

  return tasks.sort((a, b) => a.due.localeCompare(b.due) || a.title.localeCompare(b.title))
}

/** Group tasks into "This week", "Next week", then by month. */
export function groupTasks(tasks: Task[], today: Date): { label: string; tasks: Task[] }[] {
  const groups: { label: string; tasks: Task[] }[] = []
  for (const t of tasks) {
    const d = daysBetween(today, parseDate(t.due))
    const label =
      d < 7 ? 'This week' : d < 14 ? 'Next week' : parseDate(t.due).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.tasks.push(t)
    else groups.push({ label, tasks: [t] })
  }
  return groups
}

// ------------------------------------------------------------------ calendar export

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function fold(line: string): string {
  const out: string[] = []
  let rest = line
  while (rest.length > 74) {
    out.push(rest.slice(0, 74))
    rest = ' ' + rest.slice(74)
  }
  out.push(rest)
  return out.join('\r\n')
}

export const ICS_FILENAME = 'research-plan.ics'

/** The steps one application needs, including shared steps (CV, transcript, reference) that cover it. */
export function tasksFor(tasks: Task[], opportunityId: string): Task[] {
  return tasks.filter((t) => t.forIds.includes(opportunityId))
}

const icsDate = (isoDate: string) => isoDate.replace(/-/g, '')
const nextDay = (isoDate: string) => icsDate(iso(addDays(parseDate(isoDate), 1)))
const eventDetails = (t: Task, titleFor: (id: string) => string) => `${t.detail}\nFor: ${t.forIds.map(titleFor).join('; ')}`

/**
 * All-day events for any list of tasks (the whole plan, or one application's steps
 * from `tasksFor`). Each UID depends only on the task id, so importing the file again
 * updates the events instead of duplicating them, even after a due date moves.
 */
export function toICS(tasks: Task[], titleFor: (id: string) => string, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ResearchLink//Action plan//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const t of tasks) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.id}@researchlink`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(t.due)}`,
      `DTEND;VALUE=DATE:${nextDay(t.due)}`,
      fold(`SUMMARY:${icsEscape(t.title)}`),
      fold(`DESCRIPTION:${icsEscape(eventDetails(t, titleFor))}`),
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

/** A prefilled all-day Google Calendar event. Opening it sends nothing until the student saves it. */
export function googleCalendarUrl(t: Task, titleFor: (id: string) => string): string {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: t.title,
    dates: `${icsDate(t.due)}/${nextDay(t.due)}`,
    details: eventDetails(t, titleFor),
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
