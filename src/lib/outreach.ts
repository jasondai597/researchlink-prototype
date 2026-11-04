import type { ContactChannel, Opportunity, Profile } from './types'

/**
 * Informal first contact: a short, specific message to the person running the
 * project before (or alongside) the formal application. Drafts are built from the
 * student's own profile and never sent anywhere by the app.
 */

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
  chat: 'A 10-minute chat',
  'office-hours': 'Office hours drop-in',
  email: 'Email',
}

const isOffice = (name: string) => /office|coordinator/i.test(name)

export function outreachTitle(o: Opportunity): string {
  const c = o.contact!
  const who = isOffice(c.name) ? `the ${c.name.toLowerCase()}` : c.name
  if (c.channel === 'chat') return `Book a 10-minute chat with ${who}`
  if (c.channel === 'office-hours') return isOffice(c.name) ? `Drop in to ${who}` : `Drop in to ${c.name}'s office hours`
  return `Email ${who} before you apply`
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th+']

function firstName(name: string): string {
  const parts = name.split(' ')
  return parts.length === 2 && !isOffice(name) ? parts[0] : name
}

function skillLine(o: Opportunity, p: Profile | null): string {
  if (!p) return "I've worked with [one or two relevant skills] in [a course or project]."
  const relevant = [...o.requiredSkills.map((r) => r.skill), ...o.learnableSkills].filter((s) => p.skills[s])
  const mine = relevant.length ? relevant : Object.entries(p.skills).sort((a, b) => b[1] - a[1]).map(([s]) => s)
  if (!mine.length) return "I don't have research experience yet, but I'm keen to learn and can commit time consistently."
  const list = mine.slice(0, 2).join(' and ')
  return p.experience === 'research' ? `I've used ${list} in previous research work.` : `I've used ${list} in my coursework.`
}

function ask(o: Opportunity): string {
  const c = o.contact!
  if (c.channel === 'chat') return `Would you have 10 minutes for a quick chat${c.when ? ` during one of your ${c.when} slots` : ''}? I'd like to ask what the first few weeks would involve and whether my background is a good fit.`
  if (c.channel === 'office-hours') return `Would it be all right if I dropped by your office hours${c.when ? ` (${c.when})` : ''} with a couple of quick questions about the project and how to apply?`
  return 'Could you tell me whether there is still room on the project, and what you would most like to see from an applicant? I would also be glad to meet briefly if that is easier.'
}

export function draftSubject(o: Opportunity): string {
  return o.contact?.channel === 'email' ? `Question about "${o.title}"` : `Request for a short chat: "${o.title}"`
}

export function draftMessage(o: Opportunity, p: Profile | null): string {
  const c = o.contact!
  const who = p
    ? `I'm a ${ORDINAL[p.year] ?? ''} year${p.program ? ` ${p.program}` : ''} student at U of T`
    : "I'm a [year] year [program] student at U of T"
  const time = p ? `I can give about ${p.hoursPerWeek} hours a week.` : 'I can give about [hours] hours a week.'
  return [
    isOffice(c.name) ? 'Hello,' : `Hi ${firstName(c.name)},`,
    '',
    `${who}, and I'm interested in "${o.title}". ${skillLine(o, p)} ${time}`,
    '',
    ask(o),
    '',
    'Thank you for your time,',
    '[Your name]',
  ].join('\n')
}

export function mailtoHref(o: Opportunity, p: Profile | null): string | null {
  if (!o.contact?.email) return null
  return `mailto:${o.contact.email}?subject=${encodeURIComponent(draftSubject(o))}&body=${encodeURIComponent(draftMessage(o, p))}`
}
