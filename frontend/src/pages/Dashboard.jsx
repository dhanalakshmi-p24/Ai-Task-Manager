import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { ErrorState, PageHeader, Spinner } from '../components/Feedback'
import { buttonStyles } from '../lib/styles'
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/Badges'
import { PRIORITIES, STATUSES, formatDate } from '../lib/constants'

function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function BreakdownCard({ title, items, counts, total }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {/* Stacked bar gives a quick visual of the distribution. */}
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        {items.map((item) =>
          counts[item.value] ? (
            <div key={item.value} className={item.dot} style={{ width: `${(counts[item.value] / total) * 100}%` }} title={`${item.label}: ${counts[item.value]}`} />
          ) : null,
        )}
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => {
          const count = counts[item.value] ?? 0
          const pct = total ? Math.round((count / total) * 100) : 0
          return (
            <li key={item.value} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-sm ${item.dot}`} />
                {item.label}
              </span>
              <span className="tabular-nums text-slate-900">
                <span className="font-medium">{count}</span>
                <span className="ml-2 inline-block w-10 text-right text-slate-400">{pct}%</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TaskList({ title, tasks, emptyText, showDue }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</Link>
      </div>
      {tasks.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link to={`/tasks/${task.id}`} className="flex flex-col gap-2 px-5 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                  {showDue && <p className="text-xs text-slate-500">Due {formatDate(task.dueDate)}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {task.isOverdue && <OverdueBadge />}
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data: stats, loading, error, reload } = useAsync(() => dashboardApi.stats())

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="An overview of your team's work."
        actions={<Link to="/tasks?new=1" className={buttonStyles.primary}>+ New task</Link>}
      />

      {loading && <Spinner label="Loading statistics…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total tasks" value={stats.totalTasks} hint={`${stats.teamMemberCount} team members`} accent="bg-indigo-500" />
            <StatCard label="In progress" value={stats.inProgressTasks} hint={`${stats.dueThisWeek} due in the next 7 days`} accent="bg-blue-500" />
            <StatCard label="Completed" value={stats.completedTasks} hint={`${stats.completionRate}% completion rate`} accent="bg-emerald-500" />
            <StatCard label="Overdue" value={stats.overdueTasks} hint="Open tasks past due date" accent="bg-red-500" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">Overall progress</span>
              <span className="tabular-nums text-slate-600">{stats.completedTasks} of {stats.totalTasks} done</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.completionRate}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BreakdownCard title="Tasks by status" items={STATUSES} counts={stats.byStatus} total={stats.totalTasks} />
            <BreakdownCard title="Tasks by priority" items={PRIORITIES} counts={stats.byPriority} total={stats.totalTasks} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TaskList title="Upcoming deadlines" tasks={stats.upcomingTasks} emptyText="No upcoming deadlines." showDue />
            <TaskList title="Recently updated" tasks={stats.recentTasks} emptyText="No tasks yet." />
          </div>
        </div>
      )}
    </>
  )
}
