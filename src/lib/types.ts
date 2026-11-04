export type Term = 'fall' | 'winter' | 'summer'
export type Compensation = 'credit' | 'paid' | 'volunteer'
export type Experience = 'none' | 'coursework' | 'research'
export type SkillLevel = 1 | 2 | 3 // 1 = familiar, 2 = can use it, 3 = confident
export type Purpose = 'explore' | 'experience' | 'grad'
export type FederalEligibility = 'yes' | 'no' | 'unsure'
export type DocumentType = 'cv' | 'transcript' | 'reference' | 'statement' | 'supervisor' | 'form'

export interface Profile {
  year: number // 1–5
  program: string
  experience: Experience
  experienceTypes: string[]
  skills: Record<string, SkillLevel>
  hoursPerWeek: number
  terms: Term[]
  goals: Compensation[]
  purpose: Purpose
  interests: string[] // area ids
  interestText: string
  gpa: number | null // optional, on a 4.0 scale; never leaves the browser
  federalEligible: FederalEligibility | null // optional
}

export interface RequiredSkill {
  skill: string
  level: SkillLevel
}

export interface Opportunity {
  id: string
  kind: 'program' | 'project'
  title: string
  org: string
  summary: string
  areas: string[]
  keywords: string[]
  requiredSkills: RequiredSkill[]
  learnableSkills: string[]
  minYear: number
  maxYear: number | null // e.g. programs only for 1st/2nd years
  minExperience: Experience
  hoursPerWeek: number
  terms: Term[]
  compensation: Compensation
  federalOnly: boolean
  minGpa: number | null
  deadline: string | null // YYYY-MM-DD; null = rolling
  applyMethod: string
  documents: DocumentType[]
  url: string
  lastVerified: string // YYYY-MM-DD
  sample: boolean
}

export type Band = 'strong' | 'possible' | 'stretch'

export interface MatchResult {
  opportunity: Opportunity
  score: number // 0–1, used only for ordering
  band: Band
  parts: { skills: number; interest: number; time: number; experience: number }
  reasons: string[] // what fits
  gaps: string[] // what's missing
  daysToDeadline: number | null
}

export interface Excluded {
  opportunity: Opportunity
  why: string
}
