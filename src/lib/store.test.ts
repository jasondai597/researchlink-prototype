import { describe, expect, it } from 'vitest'
import { EMPTY, parseSaved } from './store'

describe('saved answers', () => {
  it('loads a profile saved before "Want to learn" existed', () => {
    const old = {
      profile: {
        year: 2,
        program: 'Psychology',
        experience: 'none',
        experienceTypes: [],
        skills: { R: 1 },
        hoursPerWeek: 6,
        terms: ['fall'],
        goals: [],
        purpose: 'explore',
        interests: ['psych'],
        interestText: '',
        gpa: null,
        federalEligible: null,
      },
      selected: ['memory-study'],
      done: [],
    }
    const saved = parseSaved(JSON.stringify(old))
    expect(saved.profile?.wantToLearn).toEqual([])
    expect(saved.profile?.skills).toEqual({ R: 1 })
    expect(saved.selected).toEqual(['memory-study'])
    expect(saved.calendared).toEqual([])
  })

  it('never keeps a skill as both rated and wanted', () => {
    const saved = parseSaved(JSON.stringify({ profile: { skills: { R: 2 }, wantToLearn: ['R', 'SQL'] } }))
    expect(saved.profile?.wantToLearn).toEqual(['SQL'])
  })

  it('falls back to empty on missing or broken data', () => {
    expect(parseSaved(null)).toEqual(EMPTY)
    expect(parseSaved('{not json')).toEqual(EMPTY)
  })
})
