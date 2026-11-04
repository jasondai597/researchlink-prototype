// Options shown on the intake form. Skill and area ids are what the matcher compares.

export const AREAS = [
  { id: 'ml', label: 'Machine learning & AI' },
  { id: 'stats', label: 'Statistics & data science' },
  { id: 'psych', label: 'Psychology & cognitive science' },
  { id: 'hci', label: 'Design & human–computer interaction' },
  { id: 'health', label: 'Health & life sciences' },
  { id: 'env', label: 'Environment & climate' },
  { id: 'social', label: 'Social sciences & policy' },
  { id: 'systems', label: 'Computer systems & databases' },
] as const

export const SKILLS = [
  'Python',
  'R',
  'Statistics',
  'Machine learning',
  'SQL',
  'Data visualization',
  'Literature review',
  'Academic writing',
  'Survey design',
  'Interviewing',
  'Experiment design',
  'Figma',
] as const

export const EXPERIENCE_TYPES = [
  'Data collection or labelling',
  'Coding or data analysis',
  'Literature review',
  'Running participants',
  'Course research project',
  'Hackathon or club project',
] as const

export const LEVEL_LABELS = { 1: 'Familiar', 2: 'Can use it', 3: 'Confident' } as const

export const TERM_LABELS = { fall: 'Fall', winter: 'Winter', summer: 'Summer' } as const

export const COMP_LABELS = { credit: 'Course credit', paid: 'Paid', volunteer: 'Volunteer' } as const

export const DOC_LABELS = {
  cv: 'CV',
  transcript: 'Transcript',
  reference: 'Reference letter',
  statement: 'Statement of interest',
  supervisor: 'Supervisor agreement',
  form: 'Application form',
} as const
