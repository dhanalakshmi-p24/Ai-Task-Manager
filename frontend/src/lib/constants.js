export const STATUSES = [
  { value: 'Todo', label: 'To Do', badge: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  { value: 'InProgress', label: 'In Progress', badge: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  { value: 'InReview', label: 'In Review', badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  { value: 'Done', label: 'Done', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
]

export const PRIORITIES = [
  { value: 'Low', label: 'Low', badge: 'bg-slate-50 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  { value: 'Medium', label: 'Medium', badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  { value: 'High', label: 'High', badge: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500' },
  { value: 'Critical', label: 'Critical', badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
]

export const statusMeta = (value) => STATUSES.find((s) => s.value === value) ?? STATUSES[0]
export const priorityMeta = (value) => PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[0]

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—'
  // Date-only strings ("2026-11-05") are parsed as local dates to avoid off-by-one timezone shifts.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return date.toLocaleDateString(undefined, options)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
