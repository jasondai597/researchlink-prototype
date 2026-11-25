import { describe, expect, it } from 'vitest'
import { studyFlag, taskEnd, taskStart, toCSV, type StudyEvent } from './study'

const ev = (event: StudyEvent['event'], at: string, detail = ''): StudyEvent => ({ event, at, detail })

describe('study mode', () => {
  it('is off unless the URL asks for it, then sticks for the tab', () => {
    expect(studyFlag('', null)).toBe(false)
    expect(studyFlag('?study=1', null)).toBe(true)
    expect(studyFlag('', '1')).toBe(true)
    expect(studyFlag('?study=0', '1')).toBe(false)
  })

  it('times the task from the earlier of start_click and first_input to the first export', () => {
    const events = [
      ev('route', '2026-11-25T10:00:00.000Z', 'intake'),
      ev('first_input', '2026-11-25T10:00:05.000Z'),
      ev('start_click', '2026-11-25T10:00:09.000Z'),
      ev('calendar_export', '2026-11-25T10:03:05.000Z', 'all'),
      ev('calendar_export', '2026-11-25T10:04:00.000Z', 'uq-ml'),
    ]
    expect(taskStart(events)).toBe(Date.parse('2026-11-25T10:00:05.000Z'))
    expect(taskEnd(events)! - taskStart(events)!).toBe(180_000)
  })

  it('exports CSV with participant, event, time, ms since start and detail', () => {
    const csv = toCSV({
      participant: 'P03',
      events: [ev('route', '2026-11-25T10:00:00.000Z', 'intake'), ev('start_click', '2026-11-25T10:00:02.000Z'), ev('submit_attempt', '2026-11-25T10:01:02.000Z', 'errors=1, "year"')],
    })
    expect(csv.split('\n')).toEqual([
      'participant,event,time,ms_since_start,detail',
      'P03,route,2026-11-25T10:00:00.000Z,-2000,intake',
      'P03,start_click,2026-11-25T10:00:02.000Z,0,',
      'P03,submit_attempt,2026-11-25T10:01:02.000Z,60000,"errors=1, ""year"""',
      '',
    ])
  })
})
