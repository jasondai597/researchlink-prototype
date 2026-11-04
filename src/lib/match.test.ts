import { describe, expect, it } from 'vitest'
import { sampleOpportunities } from '../data/opportunities'
import { groupOf, match } from './match'
import { buildPlan, toICS } from './plan'
import type { Profile } from './types'

const TODAY = new Date(2026, 10, 4) // Nov 4, 2026
const ops = sampleOpportunities(TODAY)
const byId = (id: string) => ops.find((o) => o.id === id)!

function profile(over: Partial<Profile> = {}): Profile {
  return {
    year: 3,
    program: 'Statistics',
    experience: 'coursework',
    experienceTypes: [],
    skills: { Python: 2, Statistics: 3, 'Machine learning': 2 },
    hoursPerWeek: 10,
    terms: ['winter', 'summer'],
    goals: [],
    purpose: 'grad',
    interests: ['ml', 'stats'],
    interestText: 'uncertainty in machine learning models',
    gpa: null,
    federalEligible: null,
    ...over,
  }
}

describe('hard filters', () => {
  it('excludes passed deadlines, year, term and eligibility mismatches with a reason', () => {
    const { excluded } = match(ops, profile({ year: 1, terms: ['fall'], federalEligible: 'no', gpa: 2.8 }), TODAY)
    const why = Object.fromEntries(excluded.map((e) => [e.opportunity.id, e.why]))
    expect(why['lit-review-policy']).toMatch(/Deadline passed/)
    expect(why['uq-ml']).toMatch(/year 3/)
    expect(why['summer-award']).toBeDefined()
    expect(why['federal-summer-award']).toBeDefined()
  })

  it('does not exclude on optional fields the student left blank', () => {
    const { results } = match(ops, profile({ gpa: null, federalEligible: null }), TODAY)
    expect(results.map((r) => r.opportunity.id)).toContain('federal-summer-award')
  })
})

describe('scoring', () => {
  it('ranks the ML uncertainty project first for an ML-leaning stats student', () => {
    const { results } = match(ops, profile(), TODAY)
    expect(results[0].opportunity.id).toBe('uq-ml')
    expect(results[0].band).toBe('strong')
  })

  it('explains skill gaps instead of hiding them', () => {
    const { results } = match(ops, profile({ skills: { Python: 1 } }), TODAY)
    const uq = results.find((r) => r.opportunity.id === 'uq-ml')!
    expect(uq.gaps.some((g) => g.startsWith('Python: asks for'))).toBe(true)
    expect(uq.gaps.some((g) => g.startsWith('Machine learning: not on your list'))).toBe(true)
    expect(uq.band).not.toBe('strong')
  })

  it('gives a first-year with no experience beginner-friendly options', () => {
    const p = profile({ year: 1, experience: 'none', skills: {}, interests: ['psych'], interestText: '', terms: ['fall', 'winter'], hoursPerWeek: 5 })
    const { results } = match(ops, p, TODAY)
    const top3 = results.slice(0, 3).map((r) => r.opportunity.id)
    expect(top3).toContain('memory-study')
    expect(results.find((r) => r.opportunity.id === 'uq-ml')).toBeUndefined()
  })

  it('lowers the score when compensation is not what the student wants', () => {
    const a = match(ops, profile({ goals: [] }), TODAY).results.find((r) => r.opportunity.id === 'query-pipelines')!
    const b = match(ops, profile({ goals: ['paid'] }), TODAY).results.find((r) => r.opportunity.id === 'query-pipelines')!
    expect(b.score).toBeLessThan(a.score)
  })

  it('judges summer-only roles by term choice, not term-time hours', () => {
    const r = match(ops, profile({ hoursPerWeek: 5 }), TODAY).results.find((x) => x.opportunity.id === 'summer-award')!
    expect(r.parts.time).toBe(1)
  })

  it('groups rolling and soon deadlines under "now" and far ones under "later"', () => {
    const { results } = match(ops, profile(), TODAY)
    const g = (id: string) => groupOf(results.find((r) => r.opportunity.id === id)!)
    expect(g('nlp-labelling')).toBe('now') // rolling
    expect(['later', 'stretch']).toContain(g('summer-award')) // 95 days out
  })
})

describe('action plan', () => {
  it('schedules backwards from the deadline and shares CV/transcript across applications', () => {
    const tasks = buildPlan([byId('uq-ml'), byId('summer-award')], TODAY)
    const cv = tasks.filter((t) => t.title === 'Update your CV')
    expect(cv).toHaveLength(1)
    expect(cv[0].forIds.sort()).toEqual(['summer-award', 'uq-ml'])
    expect(cv[0].due).toBe('2026-11-20') // uq-ml deadline Dec 4 minus 14 days
    expect(tasks.filter((t) => t.title === 'Submit your application')).toHaveLength(2)
  })

  it('moves steps whose ideal date has passed to today and flags them', () => {
    const tasks = buildPlan([byId('memory-study')], TODAY) // deadline in 12 days, CV ideally 14 days before
    const cv = tasks.find((t) => t.title === 'Update your CV')!
    expect(cv.due).toBe('2026-11-04')
    expect(cv.late).toBe(true)
  })

  it('exports a valid-looking calendar file', () => {
    const ics = toICS(buildPlan([byId('nlp-labelling')], TODAY), (id) => byId(id).title)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('DTSTART;VALUE=DATE:')
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true)
  })
})
