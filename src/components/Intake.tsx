import { useState, type FormEvent, type ReactNode } from 'react'
import { AREAS, COMP_LABELS, EXPERIENCE_TYPES, LEVEL_LABELS, SKILLS, TERM_LABELS } from '../data/catalog'
import { logStudy, logStudyOnce } from '../lib/study'
import type { Compensation, Experience, FederalEligibility, Profile, Purpose, SkillLevel, Term } from '../lib/types'

const BLANK: Profile = {
  year: 0,
  program: '',
  experience: 'none',
  experienceTypes: [],
  skills: {},
  wantToLearn: [],
  hoursPerWeek: 6,
  terms: [],
  goals: [],
  purpose: 'experience',
  interests: [],
  interestText: '',
  gpa: null,
  federalEligible: null,
}

const STEP_COUNT = 6

const YEARS = [1, 2, 3, 4, 5].map((y) => ({ v: y, label: y === 5 ? '5th+' : `${y}${['st', 'nd', 'rd', 'th'][y - 1]}` }))

const EXPERIENCE: { v: Experience; label: string }[] = [
  { v: 'none', label: 'Not yet' },
  { v: 'coursework', label: 'Only course projects' },
  { v: 'research', label: 'Yes, RA or lab work' },
]

const PURPOSE: { v: Purpose; label: string }[] = [
  { v: 'explore', label: 'Find out if research is for me' },
  { v: 'experience', label: 'Build experience for my CV' },
  { v: 'grad', label: 'Prepare for grad school' },
]

const FEDERAL: { v: FederalEligibility; label: string }[] = [
  { v: 'yes', label: 'Yes' },
  { v: 'no', label: 'No' },
  { v: 'unsure', label: 'Not sure' },
]

type SkillChoice = 'none' | 'want' | SkillLevel
const SKILL_CHOICES: { v: SkillChoice; label: string }[] = [
  { v: 'none', label: 'Not yet' },
  { v: 'want', label: 'Want to learn' },
  { v: 1, label: LEVEL_LABELS[1] },
  { v: 2, label: LEVEL_LABELS[2] },
  { v: 3, label: LEVEL_LABELS[3] },
]

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}

/** A skill is rated, wanted, or neither ("Not yet"), never both. */
function setSkill(p: Profile, skill: string, choice: SkillChoice): Pick<Profile, 'skills' | 'wantToLearn'> {
  const skills = { ...p.skills }
  delete skills[skill]
  const wantToLearn = p.wantToLearn.filter((s) => s !== skill)
  if (choice === 'want') wantToLearn.push(skill)
  else if (choice !== 'none') skills[skill] = choice
  return { skills, wantToLearn }
}

function Step({ n, title, optional, children }: { n: number; title: string; optional?: boolean; children: ReactNode }) {
  return (
    <section className="step" aria-labelledby={`step-${n}`}>
      <p className="step-num">
        Step {n} of {STEP_COUNT}
      </p>
      <h2 id={`step-${n}`} tabIndex={-1}>
        {title}
        {optional && <span className="opt">optional</span>}
      </h2>
      {children}
    </section>
  )
}

/** One choice from a few: real radio inputs, drawn as a segmented control. */
function Segmented<T extends string | number>({
  name,
  legend,
  options,
  value,
  onChange,
  className = '',
}: {
  name: string
  legend: ReactNode
  options: { v: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <fieldset className="group">
      <legend>{legend}</legend>
      <div className={`seg ${className}`}>
        {options.map((o) => (
          <label key={String(o.v)}>
            <input className="vh" type="radio" name={name} checked={value === o.v} onChange={() => onChange(o.v)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Any number from a list: real checkboxes, drawn as pill chips. */
function Chips<T extends string>({
  legend,
  options,
  values,
  onToggle,
}: {
  legend: ReactNode
  options: { v: T; label: string }[]
  values: T[]
  onToggle: (v: T) => void
}) {
  return (
    <fieldset className="group">
      <legend>{legend}</legend>
      <div className="chips">
        {options.map((o) => (
          <label key={o.v} className="chip">
            <input className="vh" type="checkbox" checked={values.includes(o.v)} onChange={() => onToggle(o.v)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Intake({ initial, onSubmit }: { initial: Profile | null; onSubmit: (p: Profile) => void }) {
  const [p, setP] = useState<Profile>(initial ?? BLANK)
  const [errors, setErrors] = useState<string[]>([])
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }))

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!p.year) errs.push('Pick your year of study.')
    if (!p.terms.length) errs.push('Pick at least one term you could work in.')
    if (!p.interests.length && !p.interestText.trim()) errs.push('Pick at least one area or describe what interests you.')
    setErrors(errs)
    logStudy('submit_attempt', `errors=${errs.length}`)
    if (errs.length) {
      // Wait for the summary to render, then move focus to it.
      window.setTimeout(() => document.getElementById('form-errors')?.focus(), 0)
      return
    }
    onSubmit({ ...p, interestText: p.interestText.trim(), program: p.program.trim() })
  }

  return (
    <div className="intake">
      <form className="intake-form" onSubmit={submit} onChange={() => logStudyOnce('first_input')} noValidate>
        <Step n={1} title="About you">
          <Segmented name="year" legend="Year of study" options={YEARS} value={p.year || null} onChange={(year) => set({ year })} className="seg-fit" />
          <label className="field">
            <span className="field-label">
              Program or major <span className="opt">optional</span>
            </span>
            <input value={p.program} onChange={(e) => set({ program: e.target.value })} placeholder="e.g., Statistics, Cognitive Science" />
          </label>
        </Step>

        <Step n={2} title="Experience">
          <Segmented name="exp" legend="Have you done research before?" options={EXPERIENCE} value={p.experience} onChange={(experience) => set({ experience })} />
          <Chips
            legend={
              <>
                Anything you've done, even in a course or club? <span className="opt">optional</span>
              </>
            }
            options={EXPERIENCE_TYPES.map((t) => ({ v: t as string, label: t }))}
            values={p.experienceTypes}
            onToggle={(t) => set({ experienceTypes: toggle(p.experienceTypes, t) })}
          />
        </Step>

        <Step n={3} title="Skills">
          <p className="hint">“Not yet” is a fine answer. Tell us what you'd like to learn and we'll look for projects that teach it.</p>
          <div className="skills">
            {SKILLS.map((s, i) => {
              const value: SkillChoice = p.skills[s] ?? (p.wantToLearn.includes(s) ? 'want' : 'none')
              return (
                <div className="skill-row" key={s} role="radiogroup" aria-labelledby={`skill-${i}`}>
                  <span className="skill-name" id={`skill-${i}`}>
                    {s}
                  </span>
                  <div className="seg seg-skill">
                    {SKILL_CHOICES.map((c) => (
                      <label key={c.v} className={c.v === 'want' ? 'seg-want' : undefined}>
                        <input
                          className="vh"
                          type="radio"
                          name={`skill-${i}`}
                          checked={value === c.v}
                          onChange={() => set(setSkill(p, s, c.v))}
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Step>

        <Step n={4} title="Availability">
          <label className="field field-inline">
            <span className="field-label">Hours a week during term</span>
            <input
              type="number"
              min={1}
              max={40}
              value={p.hoursPerWeek}
              onChange={(e) => set({ hoursPerWeek: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
          <Chips
            legend="Terms you could work in"
            options={(Object.keys(TERM_LABELS) as Term[]).map((t) => ({ v: t, label: `${TERM_LABELS[t]}${t === 'summer' ? ' (often full-time)' : ''}` }))}
            values={p.terms}
            onToggle={(t) => set({ terms: toggle(p.terms, t) })}
          />
          <Chips
            legend={
              <>
                What are you looking for? <span className="opt">pick any, or none</span>
              </>
            }
            options={(Object.keys(COMP_LABELS) as Compensation[]).map((c) => ({ v: c, label: COMP_LABELS[c] }))}
            values={p.goals}
            onToggle={(c) => set({ goals: toggle(p.goals, c) })}
          />
        </Step>

        <Step n={5} title="Interests">
          <Chips
            legend="Areas you're curious about"
            options={AREAS.map((a) => ({ v: a.id as string, label: a.label }))}
            values={p.interests}
            onToggle={(a) => set({ interests: toggle(p.interests, a) })}
          />
          <label className="field">
            <span className="field-label">
              In your own words <span className="opt">optional, improves matches</span>
            </span>
            <textarea
              rows={3}
              maxLength={300}
              value={p.interestText}
              onChange={(e) => set({ interestText: e.target.value })}
              placeholder="e.g., how people make decisions under uncertainty, NLP for public transit"
            />
          </label>
          <Segmented name="purpose" legend="Why research, right now?" options={PURPOSE} value={p.purpose} onChange={(purpose) => set({ purpose })} />
        </Step>

        <Step n={6} title="Eligibility" optional>
          <p className="hint">Some awards have GPA or citizenship rules. Answering filters out what you can't apply to. Leave blank to see everything.</p>
          <label className="field field-inline">
            <span className="field-label">Cumulative GPA (4.0 scale)</span>
            <input
              type="number"
              step="0.1"
              min={0}
              max={4}
              value={p.gpa ?? ''}
              onChange={(e) => set({ gpa: e.target.value === '' ? null : Math.min(4, Math.max(0, Number(e.target.value))) })}
            />
          </label>
          <Segmented
            name="fed"
            legend="Do you meet Canadian federal award eligibility (citizen or permanent resident)?"
            options={FEDERAL}
            value={p.federalEligible}
            onChange={(federalEligible) => set({ federalEligible })}
            className="seg-fit"
          />
        </Step>

        <div className="submit-bar">
          {errors.length > 0 && (
            <div id="form-errors" className="errors" tabIndex={-1} role="alert">
              {errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}
          <button className="btn btn-primary" type="submit">
            See my matches
          </button>
        </div>
      </form>
    </div>
  )
}
