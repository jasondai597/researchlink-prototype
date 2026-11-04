import { daysBetween, parseDate } from './dates'
import type { Compensation, Opportunity, Term } from './types'

/**
 * Freshness rules shared by the directory and the matcher. A listing is shown only
 * while its deadline hasn't passed and it was checked against its source recently.
 */
export const STALE_AFTER_DAYS = 30
export const FRESH_WITHIN_DAYS = 7

export function daysSinceVerified(o: Opportunity, today: Date): number {
  return daysBetween(parseDate(o.lastVerified), today)
}

export type Hidden = 'past-deadline' | 'stale'

export function hiddenReason(o: Opportunity, today: Date): Hidden | null {
  if (o.deadline && daysBetween(today, parseDate(o.deadline)) < 0) return 'past-deadline'
  if (daysSinceVerified(o, today) > STALE_AFTER_DAYS) return 'stale'
  return null
}

export interface DirectoryFilters {
  q: string
  kind: '' | Opportunity['kind']
  area: string
  compensation: '' | Compensation
  term: '' | Term
  sort: 'verified' | 'deadline'
}

export const NO_FILTERS: DirectoryFilters = { q: '', kind: '', area: '', compensation: '', term: '', sort: 'verified' }

export function browse(all: Opportunity[], f: DirectoryFilters, today: Date) {
  const hidden = { 'past-deadline': 0, stale: 0 }
  const visible: Opportunity[] = []
  for (const o of all) {
    const h = hiddenReason(o, today)
    if (h) hidden[h] += 1
    else visible.push(o)
  }
  const words = f.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const list = visible.filter((o) => {
    if (f.kind && o.kind !== f.kind) return false
    if (f.area && !o.areas.includes(f.area)) return false
    if (f.compensation && o.compensation !== f.compensation) return false
    if (f.term && !o.terms.includes(f.term)) return false
    if (words.length) {
      const hay = [o.title, o.org, o.summary, ...o.keywords, ...o.requiredSkills.map((s) => s.skill), ...o.learnableSkills]
        .join(' ')
        .toLowerCase()
      if (!words.every((w) => hay.includes(w))) return false
    }
    return true
  })
  list.sort((a, b) =>
    f.sort === 'deadline'
      ? (a.deadline ?? '9999-12-31').localeCompare(b.deadline ?? '9999-12-31')
      : b.lastVerified.localeCompare(a.lastVerified) || a.title.localeCompare(b.title),
  )
  return { list, hidden, total: visible.length }
}
