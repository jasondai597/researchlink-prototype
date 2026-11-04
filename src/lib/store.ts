import { useCallback, useEffect, useState } from 'react'
import type { Profile } from './types'

const KEY = 'researchlink-v1'

export interface Saved {
  profile: Profile | null
  selected: string[] // opportunity ids added to the plan
  done: string[] // task ids checked off
}

const EMPTY: Saved = { profile: null, selected: [], done: [] }

function read(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
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
