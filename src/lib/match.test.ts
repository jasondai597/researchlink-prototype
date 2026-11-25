import { describe, expect, it } from 'vitest'
import { sampleOpportunities } from '../data/opportunities'
import { WANT_TO_LEARN_BONUS, groupOf, match } from './match'
import { draftMessage, mailtoHref } from './outreach'
import { buildPlan, fold, googleCalendarUrl, tasksFor, toICS } from './plan'
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
    wantToLearn: [],
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

describe('want to learn', () => {
  it('never counts a wanted skill toward a requirement', () => {
    const base = match(ops, profile({ skills: { Statistics: 3, 'Machine learning': 2 } }), TODAY).results.find((r) => r.opportunity.id === 'uq-ml')!
    const wants = match(ops, profile({ skills: { Statistics: 3, 'Machine learning': 2 }, wantToLearn: ['Python'] }), TODAY).results.find(
      (r) => r.opportunity.id === 'uq-ml',
    )!
    expect(wants.parts.skills).toBe(base.parts.skills)
    expect(wants.score).toBe(base.score) // uq-ml doesn't teach Python, so no bonus either
    expect(wants.gaps).toContain('Python: asks for "Can use it"; you want to learn it')
    expect(wants.reasons).toContain('You meet 2 of 3 required skills')
  })

  it('explains the match when a project teaches a skill the student wants', () => {
    const p = profile({ year: 1, experience: 'none', skills: {}, wantToLearn: ['Experiment design'], interests: ['psych'], interestText: '', terms: ['fall'] })
    const r = match(ops, p, TODAY).results.find((x) => x.opportunity.id === 'memory-study')!
    expect(r.reasons).toContain('You want to learn Experiment design, and this project teaches it on the job')
    expect(r.reasons.some((x) => x.startsWith("You'll learn on the job:") && x.includes('Experiment design'))).toBe(false)
    const without = match(ops, { ...p, wantToLearn: [] }, TODAY).results.find((x) => x.opportunity.id === 'memory-study')!
    expect(r.score).toBeCloseTo(Math.min(1, without.score + WANT_TO_LEARN_BONUS))
  })

  it('adds the bonus once and caps the score at 1', () => {
    // A perfect fit for the beginner program already scores 1; wanting two skills it teaches can't push it over.
    const p = profile({ year: 1, experience: 'none', skills: {}, interests: ['psych'], interestText: '', terms: ['fall'], hoursPerWeek: 10 })
    const perfect = match(ops, p, TODAY).results.find((x) => x.opportunity.id === 'first-year-program')!
    expect(perfect.score).toBeCloseTo(1)
    expect(perfect.score + WANT_TO_LEARN_BONUS).toBeGreaterThan(1) // so the cap is what keeps it at 1
    const wants = match(ops, { ...p, wantToLearn: ['Literature review', 'Survey design'] }, TODAY).results.find(
      (x) => x.opportunity.id === 'first-year-program',
    )!
    expect(wants.score).toBe(1)
    expect(wants.band).toBe('strong')
    expect(wants.reasons.filter((x) => x.startsWith('You want to learn'))).toHaveLength(2)
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

describe('calendar export', () => {
  const titleFor = (id: string) => byId(id).title
  const uids = (ics: string) => ics.split('\r\n').filter((l) => l.startsWith('UID:'))
  const plan = buildPlan([byId('uq-ml'), byId('summer-award'), byId('memory-study')], TODAY)

  it("exports only one application's steps, including merged shared steps", () => {
    const mine = tasksFor(plan, 'memory-study')
    expect(mine.length).toBeGreaterThan(0)
    expect(mine.every((t) => t.forIds.includes('memory-study'))).toBe(true)
    const cv = mine.find((t) => t.id === 'shared-cv')!
    expect(cv.forIds.sort()).toEqual(['memory-study', 'summer-award', 'uq-ml']) // merged step is included
    expect(mine.some((t) => t.id === 'uq-ml-submit')).toBe(false)

    const ics = toICS(mine, titleFor)
    expect(uids(ics)).toHaveLength(mine.length)
    expect(ics).toContain('UID:shared-cv@researchlink')
    expect(ics).toContain('UID:memory-study-submit@researchlink')
    expect(ics).not.toContain('UID:uq-ml-submit@researchlink')
  })

  it('keeps UIDs stable across exports, so re-importing updates instead of duplicating', () => {
    const later = new Date(2026, 10, 20) // after some ideal dates have passed, so due dates move
    const again = buildPlan([byId('uq-ml'), byId('summer-award'), byId('memory-study')], later)
    const a = uids(toICS(tasksFor(plan, 'uq-ml'), titleFor, TODAY))
    const b = uids(toICS(tasksFor(again, 'uq-ml'), titleFor, later))
    expect(b.sort()).toEqual(a.sort())
    // The per-application file and the whole-plan file use the same UID for the same step.
    expect(uids(toICS(plan, titleFor))).toEqual(expect.arrayContaining(a))
  })

  it('folds lines at 75 bytes without splitting multi-byte characters', () => {
    const bytes = (l: string) => new TextEncoder().encode(l).length
    const long = 'DESCRIPTION:' + 'Send a short email with one project you’ve built. Café ’’’ '.repeat(6)
    const lines = fold(long).split('\r\n')
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.every((l) => bytes(l) <= 75)).toBe(true)
    expect(lines.slice(1).every((l) => l.startsWith(' '))).toBe(true)
    expect(lines.map((l, i) => (i ? l.slice(1) : l)).join('')).toBe(long) // unfolds back exactly
    const ics = toICS(buildPlan(ops, TODAY), titleFor)
    expect(ics.split('\r\n').every((l) => bytes(l) <= 75)).toBe(true)
  })

  it('builds a prefilled all-day Google Calendar link', () => {
    const t = tasksFor(plan, 'uq-ml').find((x) => x.id === 'uq-ml-submit')!
    const url = new URL(googleCalendarUrl(t, titleFor))
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('text')).toBe('Submit your application')
    expect(url.searchParams.get('dates')).toBe('20261202/20261203')
    expect(url.searchParams.get('details')).toContain('For: Uncertainty estimates for ML models (sample)')
  })
})

describe('informal outreach', () => {
  it('adds a first-contact step three weeks before the deadline, named for the preferred channel', () => {
    const tasks = buildPlan([byId('uq-ml')], TODAY) // deadline Dec 4, contact prefers email
    const t = tasks.find((x) => x.outreach === 'uq-ml')!
    expect(t.title).toBe('Email Priya Natarajan before you apply')
    expect(t.due).toBe('2026-11-13')
    expect(t.late).toBe(false)
  })

  it('schedules outreach within two days for rolling listings, without flagging it late', () => {
    const t = buildPlan([byId('nlp-labelling')], TODAY).find((x) => x.outreach)!
    expect(t.title).toBe('Book a 10-minute chat with Maya Chen')
    expect(t.due).toBe('2026-11-06')
    expect(t.late).toBe(false)
  })

  it('drafts a message from the profile, with placeholders when there is none', () => {
    const o = byId('uq-ml')
    const withProfile = draftMessage(o, profile())
    expect(withProfile).toContain("I'm a 3rd year Statistics student")
    expect(withProfile).toContain('Python and Machine learning')
    expect(withProfile).toContain('10 hours a week')
    expect(withProfile.startsWith('Hi Priya,')).toBe(true)
    expect(draftMessage(o, null)).toContain('[year] year [program]')
    expect(mailtoHref(o, null)).toMatch(/^mailto:priya\.natarajan@example\.com\?subject=/)
  })
})

describe('outreach wording', () => {
  it('names offices naturally', () => {
    const t = buildPlan([byId('first-year-program')], TODAY).find((x) => x.outreach)!
    expect(t.title).toBe('Drop in to the program office')
    const e = buildPlan([byId('summer-award')], TODAY).find((x) => x.outreach)!
    expect(e.title).toBe('Email the awards office before you apply')
  })
})
