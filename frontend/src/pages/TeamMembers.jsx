import { teamMembersApi } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/Feedback'
import { formatDate } from '../lib/constants'

const AVATAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500']

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

function MemberCard({ member }) {
  return (
    <li className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${AVATAR_COLORS[member.id % AVATAR_COLORS.length]}`}>
          {initials(member.fullName)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{member.fullName}</p>
          <p className="truncate text-sm text-slate-500">{member.role}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Department</dt>
          <dd className="truncate text-slate-900">{member.department}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Email</dt>
          <dd className="truncate">
            <a href={`mailto:${member.email}`} className="text-indigo-600 hover:text-indigo-500">{member.email}</a>
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Status</dt>
          <dd>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {member.isActive ? 'Active' : 'Away'}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Member since</dt>
          <dd className="text-slate-900">{formatDate(member.createdAt)}</dd>
        </div>
      </dl>
    </li>
  )
}

export default function TeamMembers() {
  const { data: members, loading, error, reload } = useAsync(() => teamMembersApi.list())

  return (
    <>
      <PageHeader
        title="Team Members"
        subtitle={members ? `${members.length} people on the team` : 'The people on your team'}
      />
      {loading && <Spinner label="Loading team…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {members && members.length === 0 && <EmptyState title="No team members yet" />}
      {members && members.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => <MemberCard key={m.id} member={m} />)}
        </ul>
      )}
    </>
  )
}
