import { priorityMeta, statusMeta } from '../lib/constants'

function Badge({ meta }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export const StatusBadge = ({ status }) => <Badge meta={statusMeta(status)} />
export const PriorityBadge = ({ priority }) => <Badge meta={priorityMeta(priority)} />

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">Overdue</span>
  )
}
