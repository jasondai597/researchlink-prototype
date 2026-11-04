import { AREAS, COMP_LABELS, LEVEL_LABELS, TERM_LABELS } from '../data/catalog'
import { daysBetween, formatDate, parseDate } from './dates'
import type { Band, Excluded, Experience, MatchResult, Opportunity, Profile } from './types'

/**
 * Matching = hard filters first, then a weighted score from four parts.
 * The weights are a starting guess, not calibrated against real outcomes, so the
 * UI shows bands and reasons rather than the raw number.
 */
export const WEIGHTS = { skills: 0.4, interest: 0.3, time: 0.2, experience: 0.1 }
export const COMP_MISMATCH_FACTOR = 0.85
export const BANDS = { strong: 0.75, possible: 0.5 }

const EXPERIENCE_RANK: Record<Experience, number> = { none: 0, coursework: 1, research: 2 }
const areaLabel = (id: string) => AREAS.find((a) => a.id === id)?.label ?? id

// ------------------------------------------------------------------ hard filters

export function exclusionReason(o: Opportunity, p: Profile, today: Date): string | null {
  if (o.deadline && daysBetween(today, parseDate(o.deadline)) < 0) {
    return `Deadline passed on ${formatDate(o.deadline)}`
  }
  if (p.year < o.minYear) return `Open from year ${o.minYear}; you're in year ${p.year}`
  if (o.maxYear !== null && p.year > o.maxYear) return `Only for students up to year ${o.maxYear}`
  if (p.terms.length && !o.terms.some((t) => p.terms.includes(t))) {
    return `Runs in ${o.terms.map((t) => TERM_LABELS[t]).join(' / ')}; you picked ${p.terms.map((t) => TERM_LABELS[t]).join(' / ')}`
  }
  if (o.federalOnly && p.federalEligible === 'no') return 'Limited to students who meet federal eligibility rules'
  if (o.minGpa !== null && p.gpa !== null && p.gpa < o.minGpa) return `Usually expects a GPA of ${o.minGpa.toFixed(1)} or higher`
  return null
}

// ------------------------------------------------------------------ text similarity (TF-IDF cosine)

const STOP = new Set(
  'a an and the of to in on for with or at by from is are be as it this that i im i\'m my me want would like interested interest into about work working research project projects some any more how what'.split(' '),
)

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w))
}

function docText(o: Opportunity): string {
  return [o.title, o.summary, ...o.keywords].join(' ')
}

function termFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1)
  return m
}

export function buildIdf(docs: string[][]): Map<string, number> {
  const df = new Map<string, number>()
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1)
  const idf = new Map<string, number>()
  for (const [t, n] of df) idf.set(t, Math.log((1 + docs.length) / (1 + n)) + 1)
  return idf
}

export function cosine(a: string[], b: string[], idf: Map<string, number>): { score: number; shared: string[] } {
  const ta = termFreq(a)
  const tb = termFreq(b)
  let dot = 0
  let na = 0
  let nb = 0
  const shared: string[] = []
  const w = (t: string) => idf.get(t) ?? Math.log(2) + 1
  for (const [t, c] of ta) {
    const v = c * w(t)
    na += v * v
    const cb = tb.get(t)
    if (cb) {
      dot += v * cb * w(t)
      shared.push(t)
    }
  }
  for (const [t, c] of tb) nb += (c * w(t)) ** 2
  if (!na || !nb) return { score: 0, shared: [] }
  return { score: dot / (Math.sqrt(na) * Math.sqrt(nb)), shared }
}

// ------------------------------------------------------------------ scoring

export function scoreOne(o: Opportunity, p: Profile, today: Date, idf: Map<string, number>): MatchResult {
  const reasons: string[] = []
  const gaps: string[] = []

  // Skills: full credit at the required level, half credit one level below.
  let skills = 1
  if (o.requiredSkills.length) {
    let total = 0
    let met = 0
    for (const r of o.requiredSkills) {
      const have = p.skills[r.skill] ?? 0
      if (have >= r.level) {
        total += 1
        met += 1
      } else if (have === r.level - 1 && have > 0) {
        total += 0.5
        gaps.push(`${r.skill}: asks for "${LEVEL_LABELS[r.level]}", you said "${LEVEL_LABELS[have as 1 | 2 | 3]}"`)
      } else {
        gaps.push(`${r.skill}: not on your list yet`)
      }
    }
    skills = total / o.requiredSkills.length
    reasons.push(`You meet ${met} of ${o.requiredSkills.length} required skill${o.requiredSkills.length === 1 ? '' : 's'}`)
  } else {
    reasons.push('No specific skills required')
  }
  if (o.learnableSkills.length) reasons.push(`You'll learn on the job: ${o.learnableSkills.join(', ')}`)

  // Interest: area overlap, blended with free-text similarity when the student wrote something.
  const sharedAreas = o.areas.filter((a) => p.interests.includes(a))
  const areaScore = p.interests.length === 0 ? 0.5 : sharedAreas.length ? 1 : 0
  const textTokens = tokenize(p.interestText)
  let interest = areaScore
  if (textTokens.length) {
    const sim = cosine(textTokens, tokenize(docText(o)), idf)
    const text = Math.min(1, sim.score * 2.5) // short queries give small cosines; rescale
    interest = 0.6 * areaScore + 0.4 * text
    if (sim.shared.length) reasons.push(`Matches what you wrote: ${sim.shared.slice(0, 3).join(', ')}`)
  }
  if (sharedAreas.length && o.areas.length <= 3) reasons.push(`In your area: ${sharedAreas.map(areaLabel).join(', ')}`)
  else if (p.interests.length && !sharedAreas.length) gaps.push('Outside the areas you picked')

  // Time: summer-only roles are full-time, so judge them by term choice, not term-time hours.
  let time: number
  const summerOnly = o.terms.length === 1 && o.terms[0] === 'summer'
  if (summerOnly) {
    time = p.terms.includes('summer') ? 1 : 0.3
    reasons.push('Full-time summer role')
  } else if (p.hoursPerWeek >= o.hoursPerWeek) {
    time = 1
    reasons.push(`Fits your ${p.hoursPerWeek} h/week (needs ${o.hoursPerWeek})`)
  } else {
    time = p.hoursPerWeek / o.hoursPerWeek
    gaps.push(`Needs ${o.hoursPerWeek} h/week; you have ${p.hoursPerWeek}`)
  }

  // Experience
  let experience = 1
  if (EXPERIENCE_RANK[p.experience] >= EXPERIENCE_RANK[o.minExperience]) {
    if (o.minExperience === 'none') reasons.push('Open to students with no research experience')
  } else {
    experience = 0.4
    gaps.push(o.minExperience === 'research' ? 'Usually expects prior research experience' : 'Usually expects related coursework')
  }

  let score = WEIGHTS.skills * skills + WEIGHTS.interest * interest + WEIGHTS.time * time + WEIGHTS.experience * experience
  if (p.goals.length && !p.goals.includes(o.compensation)) {
    score *= COMP_MISMATCH_FACTOR
    gaps.push(`${COMP_LABELS[o.compensation]}; you're looking for ${p.goals.map((g) => COMP_LABELS[g].toLowerCase()).join(' or ')}`)
  }
  if (o.federalOnly && p.federalEligible !== 'yes') gaps.push('Check the federal eligibility rules before applying')
  if (o.minGpa !== null && p.gpa === null) gaps.push(`Usually expects a GPA of ${o.minGpa.toFixed(1)}+`)

  const daysToDeadline = o.deadline ? daysBetween(today, parseDate(o.deadline)) : null
  return {
    opportunity: o,
    score,
    band: bandFor(score),
    parts: { skills, interest, time, experience },
    reasons,
    gaps,
    daysToDeadline,
  }
}

export function bandFor(score: number): Band {
  if (score >= BANDS.strong) return 'strong'
  if (score >= BANDS.possible) return 'possible'
  return 'stretch'
}

export function match(
  opportunities: Opportunity[],
  p: Profile,
  today: Date,
): { results: MatchResult[]; excluded: Excluded[] } {
  const idf = buildIdf(opportunities.map((o) => tokenize(docText(o))))
  const results: MatchResult[] = []
  const excluded: Excluded[] = []
  for (const o of opportunities) {
    const why = exclusionReason(o, p, today)
    if (why) excluded.push({ opportunity: o, why })
    else results.push(scoreOne(o, p, today, idf))
  }
  results.sort((a, b) => b.score - a.score || (a.daysToDeadline ?? 999) - (b.daysToDeadline ?? 999))
  return { results, excluded }
}

/** How the results page groups matches. */
export const SOON_DAYS = 45
export function groupOf(r: MatchResult): 'now' | 'later' | 'stretch' {
  if (r.band === 'stretch') return 'stretch'
  if (r.daysToDeadline === null || r.daysToDeadline <= SOON_DAYS) return 'now'
  return 'later'
}
