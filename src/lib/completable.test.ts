import { describe, expect, it } from 'vitest'
import { AREAS } from '../data/catalog'
import { sampleOpportunities } from '../data/opportunities'
import { iso } from './dates'
import { NO_FILTERS, browse } from './directory'
import { match } from './match'
import { buildPlan, tasksFor, toICS } from './plan'
import type { Experience, FederalEligibility, Profile, Term } from './types'

/**
 * The usability task is "get matched, add something to your plan, put it in your
 * calendar". It has to be possible for every valid set of answers, including a
 * student who answers "Not yet" for every skill and picks no goals.
 */
const TODAY = new Date(2026, 10, 25)
const ops = sampleOpportunities(TODAY)
const titleFor = (id: string) => ops.find((o) => o.id === id)!.title

const YEARS = [1, 2, 3, 4, 5]
const TERMS: Term[] = ['fall', 'winter', 'summer']
const EXPERIENCE: Experience[] = ['none', 'coursework', 'research']
const INTERESTS: { interests: string[]; interestText: string }[] = [
  ...AREAS.map((a) => ({ interests: [a.id], interestText: '' })),
  { interests: [], interestText: 'something hands-on' }, // free text only is also valid
]
const ELIGIBILITY: { federalEligible: FederalEligibility | null; gpa: number | null }[] = [
  { federalEligible: null, gpa: null },
  { federalEligible: 'no', gpa: 2.0 },
]

function* validProfiles(): Generator<Profile> {
  for (const year of YEARS)
    for (const term of TERMS)
      for (const experience of EXPERIENCE)
        for (const interest of INTERESTS)
          for (const elig of ELIGIBILITY)
            yield {
              year,
              program: '',
              experience,
              experienceTypes: [],
              skills: {}, // "Not yet" for every skill
              wantToLearn: [],
              hoursPerWeek: 1,
              terms: [term],
              goals: [],
              purpose: 'explore',
              ...interest,
              ...elig,
            }
}

describe('the study task can always be completed', () => {
  it('gives every valid profile a match it can plan and export', () => {
    const failures: string[] = []
    let checked = 0
    for (const p of validProfiles()) {
      checked += 1
      const { results } = match(ops, p, TODAY)
      const o = results[0]?.opportunity
      if (!o) {
        failures.push(`year ${p.year}, ${p.terms[0]}, ${p.experience}, ${p.interests[0] ?? 'text'}, fed=${p.federalEligible}, gpa=${p.gpa}`)
        continue
      }
      expect(o.deadline === null || o.deadline >= iso(TODAY)).toBe(true)
      const tasks = tasksFor(buildPlan([o], TODAY), o.id)
      expect(tasks.length).toBeGreaterThan(0)
      expect(tasks.every((t) => t.due >= iso(TODAY))).toBe(true)
      const ics = toICS(tasks, titleFor)
      expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(tasks.length)
    }
    expect(checked).toBe(5 * 3 * 3 * (AREAS.length + 1) * 2)
    expect(failures).toEqual([])
  })

  it('always has an open directory listing for every term', () => {
    for (const term of TERMS) {
      const { list } = browse(ops, { ...NO_FILTERS, term }, TODAY)
      expect(list.length).toBeGreaterThan(0)
      const o = list[0]
      expect(toICS(tasksFor(buildPlan([o], TODAY), o.id), titleFor)).toContain('BEGIN:VEVENT')
    }
  })
})
