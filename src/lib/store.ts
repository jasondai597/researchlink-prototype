import { useCallback, useEffect, useState } from 'react'
import type { Profile } from './types'

const KEY = 'researchlink-v1'

export interface Saved {
  profile: Profile | null
  selected: string[] // opportunity ids added to the plan
  done: string[] // task ids checked off
  calendared: string[] // opportunity ids whose steps were downloaded as .ics
}

export const EMPTY: Saved = { profile: null, selected: [], done: [], calendared: [] }

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

/**
 * Bring a profile saved by an older version up to date. Profiles saved before
 * "Want to learn" existed have no `wantToLearn`; a skill is either rated or wanted,
 * never both, so rated skills win.
 */
export function normalizeProfile(p: Profile): Profile {
  const skills = p.skills && typeof p.skills === 'object' ? p.skills : {}
  return { ...p, skills, wantToLearn: strings(p.wantToLearn).filter((s) => !(s in skills)) }
}

/** Parse what's in localStorage. Pure, so it can be tested without a browser. */
export function parseSaved(raw: string | null): Saved {
  if (!raw) return EMPTY
  try {
    const data = JSON.parse(raw) as Partial<Saved>
    return {
      profile: data.profile ? normalizeProfile(data.profile) : null,
      selected: strings(data.selected),
      done: strings(data.done),
      calendared: strings(data.calendared),
    }
  } catch {
    return EMPTY
  }
}

function read(): Saved {
  try {
    return parseSaved(localStorage.getItem(KEY))
  } catch {
    return EMPTY
  }
}

/** Everything stays in this browser. Nothing is sent anywhere. */
export function useSaved() {
  const [saved, setSaved] = useState<Saved>(read)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved))
    } catch {
      /* private mode or storage blocked: keep working in memory */
    }
  }, [saved])
  const update = useCallback((patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch })), [])
  const reset = useCallback(() => setSaved(EMPTY), [])
  return { saved, update, reset }
}

export function useHashRoute(): [string, (to: string) => void] {
  const get = () => location.hash.replace(/^#\/?/, '') || ''
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const on = () => {
      setRoute(get())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((to: string) => {
    location.hash = `#/${to}`
  }, [])
  return [route, go]
}
