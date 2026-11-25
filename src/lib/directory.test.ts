import { describe, expect, it } from 'vitest'
import { sampleOpportunities } from '../data/opportunities'
import { NO_FILTERS, browse, hiddenReason } from './directory'
import { match } from './match'
import type { Profile } from './types'

const TODAY = new Date(2026, 10, 4)
const ops = sampleOpportunities(TODAY)
const byId = (id: string) => ops.find((o) => o.id === id)!

describe('directory freshness', () => {
  it('hides past deadlines and listings not verified in 30 days, and counts them', () => {
    expect(hiddenReason(byId('lit-review-policy'), TODAY)).toBe('past-deadline')
    expect(hiddenReason(byId('climate-viz'), TODAY)).toBe('stale')
    const { list, hidden } = browse(ops, NO_FILTERS, TODAY)
    expect(hidden).toEqual({ 'past-deadline': 1, stale: 1 })
    expect(list.map((o) => o.id)).not.toContain('climate-viz')
  })

  it('sorts by most recently verified by default', () => {
    const { list } = browse(ops, NO_FILTERS, TODAY)
    expect(list[0].id).toBe('memory-study') // verified today
  })

  it('sorts by soonest deadline with rolling listings last', () => {
    const { list } = browse(ops, { ...NO_FILTERS, sort: 'deadline' }, TODAY)
    expect(list[0].id).toBe('memory-study') // 12 days
    expect(list[list.length - 1].deadline).toBeNull()
  })

  it('filters by kind, area, compensation, term and search words', () => {
    const r = browse(ops, { ...NO_FILTERS, kind: 'project', area: 'ml', compensation: 'credit', term: 'winter', q: 'uncertainty' }, TODAY)
    expect(r.list.map((o) => o.id)).toEqual(['uq-ml'])
  })

  it('keeps stale listings out of matches too', () => {
    const p: Profile = { year: 3, program: '', experience: 'coursework', experienceTypes: [], skills: { R: 3, 'Data visualization': 3 }, wantToLearn: [], hoursPerWeek: 10, terms: ['fall', 'winter'], goals: [], purpose: 'experience', interests: ['env'], interestText: 'climate charts', gpa: null, federalEligible: null }
    const { excluded } = match(ops, p, TODAY)
    expect(excluded.find((e) => e.opportunity.id === 'climate-viz')?.why).toMatch(/Not verified/)
  })
})
