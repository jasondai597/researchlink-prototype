import { useState, type FormEvent } from 'react'
import { AREAS, COMP_LABELS, EXPERIENCE_TYPES, LEVEL_LABELS, SKILLS, TERM_LABELS } from '../data/catalog'
import type { Compensation, Experience, FederalEligibility, Profile, Purpose, SkillLevel, Term } from '../lib/types'

const BLANK: Profile = {
  year: 0,
  program: '',
  experience: 'none',
  experienceTypes: [],
  skills: {},
  hoursPerWeek: 6,
  terms: [],
  goals: [],
  purpose: 'experience',
  interests: [],
  interestText: '',
  gpa: null,
  federalEligible: null,
}

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

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
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
    if (errs.length) {
      document.getElementById('form-errors')?.focus()
      return
    }
    onSubmit({ ...p, interestText: p.interestText.trim(), program: p.program.trim() })
  }

  return (
    <div className="intake">
      <div className="intake-intro">
        <h1>Where could you do research?</h1>
        <p className="lede">
          Answer a few questions and we'll match you to research programs and projects you can actually apply to, explain
          why each one fits, and turn the deadlines into a step-by-step plan.
        </p>
        <p className="privacy">Takes about 2 minutes. Your answers stay in this browser; nothing is sent anywhere.</p>
      </div>

      <form className="intake-form" onSubmit={submit} noValidate>
        <section className="q">
          <h2>
            <span className="q-num">1</span>About you
          </h2>
          <fieldset>
            <legend>Year of study</legend>
            <div className="seg">
              {[1, 2, 3, 4, 5].map((y) => (
                <label key={y}>
                  <input type="radio" name="year" checked={p.year === y} onChange={() => set({ year: y })} />
                  <span>{y === 5 ? '5th+' : `${y}${['st', 'nd', 'rd', 'th'][y - 1]}`}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>
              Program or major <span className="opt">optional</span>
            </span>
            <input value={p.program} onChange={(e) => set({ program: e.target.value })} placeholder="e.g., Statistics, Cognitive Science" />
          </label>
        </section>

        <section className="q">
          <h2>
            <span className="q-num">2</span>Experience
          </h2>
          <fieldset>
            <legend>Have you done research before?</legend>
            <div className="seg">
              {EXPERIENCE.map((x) => (
                <label key={x.v}>
                  <input type="radio" name="exp" checked={p.experience === x.v} onChange={() => set({ experience: x.v })} />
                  <span>{x.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              Anything you've done, even in a course or club? <span className="opt">optional</span>
            </legend>
            <div className="chips">
              {EXPERIENCE_TYPES.map((t) => (
                <label key={t} className="chip">
                  <input type="checkbox" checked={p.experienceTypes.includes(t)} onChange={() => set({ experienceTypes: toggle(p.experienceTypes, t) })} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="q">
          <h2>
            <span className="q-num">3</span>Skills
          </h2>
          <p className="hint">Rate only what you've used. Leave the rest blank; many projects teach skills on the job.</p>
          <div className="skills">
            {SKILLS.map((s) => {
              const lvl = p.skills[s] ?? 0
              return (
                <div className="skill-row" key={s} role="radiogroup" aria-label={s}>
                  <span className="skill-name">{s}</span>
                  <div className="levels">
                    {([0, 1, 2, 3] as const).map((l) => (
                      <label key={l} className={l === 0 ? 'lvl lvl-none' : 'lvl'}>
                        <input
                          type="radio"
                          name={`skill-${s}`}
                          checked={lvl === l}
                          onChange={() => {
                            const next = { ...p.skills }
                            if (l === 0) delete next[s]
                            else next[s] = l as SkillLevel
                            set({ skills: next })
                          }}
                        />
                        <span>{l === 0 ? '–' : LEVEL_LABELS[l]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="q">
          <h2>
            <span className="q-num">4</span>Availability
          </h2>
          <label className="field field-inline">
            Hours a week during term
            <input type="number" min={1} max={40} value={p.hoursPerWeek} onChange={(e) => set({ hoursPerWeek: Math.max(1, Number(e.target.value) || 1) })} />
          </label>
          <fieldset>
            <legend>Terms you could work in</legend>
            <div className="chips">
              {(Object.keys(TERM_LABELS) as Term[]).map((t) => (
                <label key={t} className="chip">
                  <input type="checkbox" checked={p.terms.includes(t)} onChange={() => set({ terms: toggle(p.terms, t) })} />
                  <span>{TERM_LABELS[t]}{t === 'summer' ? ' (often full-time)' : ''}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              What are you looking for? <span className="opt">pick any, or none</span>
            </legend>
            <div className="chips">
              {(Object.keys(COMP_LABELS) as Compensation[]).map((c) => (
                <label key={c} className="chip">
                  <input type="checkbox" checked={p.goals.includes(c)} onChange={() => set({ goals: toggle(p.goals, c) })} />
                  <span>{COMP_LABELS[c]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="q">
          <h2>
            <span className="q-num">5</span>Interests
          </h2>
          <fieldset>
            <legend>Areas you're curious about</legend>
            <div className="chips">
              {AREAS.map((a) => (
                <label key={a.id} className="chip">
                  <input type="checkbox" checked={p.interests.includes(a.id)} onChange={() => set({ interests: toggle(p.interests, a.id) })} />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>
              In your own words <span className="opt">optional, improves matches</span>
            </span>
            <textarea
              rows={2}
              maxLength={300}
              value={p.interestText}
              onChange={(e) => set({ interestText: e.target.value })}
              placeholder="e.g., how people make decisions under uncertainty, NLP for public transit"
            />
          </label>
          <fieldset>
            <legend>Why research, right now?</legend>
            <div className="seg seg-wide">
              {PURPOSE.map((x) => (
                <label key={x.v}>
                  <input type="radio" name="purpose" checked={p.purpose === x.v} onChange={() => set({ purpose: x.v })} />
                  <span>{x.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="q q-optional">
          <h2>
            <span className="q-num">6</span>Eligibility <span className="opt">optional</span>
          </h2>
          <p className="hint">Some awards have GPA or citizenship rules. Answering filters out what you can't apply to. Leave blank to see everything.</p>
          <label className="field field-inline">
            Cumulative GPA (4.0 scale)
            <input
              type="number"
              step="0.1"
              min={0}
              max={4}
              value={p.gpa ?? ''}
              onChange={(e) => set({ gpa: e.target.value === '' ? null : Math.min(4, Math.max(0, Number(e.target.value))) })}
            />
          </label>
          <fieldset>
            <legend>Do you meet Canadian federal award eligibility (citizen or permanent resident)?</legend>
            <div className="seg">
              {(['yes', 'no', 'unsure'] as FederalEligibility[]).map((v) => (
                <label key={v}>
                  <input type="radio" name="fed" checked={p.federalEligible === v} onChange={() => set({ federalEligible: v })} />
                  <span>{v === 'unsure' ? 'Not sure' : v[0].toUpperCase() + v.slice(1)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

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
