import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { tasksApi } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { ErrorState, Spinner } from '../components/Feedback'
import { buttonStyles } from '../lib/styles'
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/Badges'
import TaskFormModal from '../components/TaskFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { STATUSES, formatDate, formatDateTime } from '../lib/constants'

function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 sm:grid sm:grid-cols-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-900 sm:col-span-2 sm:text-left">{children}</dd>
    </div>
  )
}

export default function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: task, loading, error, reload } = useAsync(() => tasksApi.get(id), [id])
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function changeStatus(newStatus) {
    if (newStatus === task.status) return
    setUpdatingStatus(true)
    setStatusError(null)
    try {
      const { title, description, priority, dueDate } = task
      await tasksApi.update(task.id, { title, description, priority, dueDate, status: newStatus })
      reload()
    } catch (err) {
      setStatusError(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading && !task) return <Spinner label="Loading task…" />
  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to tasks</Link>
        <ErrorState message={error.status === 404 ? 'This task does not exist or has been deleted.' : error.message} onRetry={error.status === 404 ? undefined : reload} />
      </div>
    )
  }

  return (
    <>
      <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to tasks</Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Task #{task.id}</p>
              <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900">{task.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.isOverdue && <OverdueBadge />}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" className={buttonStyles.secondary} onClick={() => setEditing(true)}>Edit</button>
              <button type="button" className={buttonStyles.danger} onClick={() => setDeleting(true)}>Delete</button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            {task.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{task.description}</p>
            ) : (
              <p className="mt-2 text-sm italic text-slate-400">No description provided.</p>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Details</h2>
            <dl className="mt-2 divide-y divide-slate-100">
              <DetailRow label="Status"><StatusBadge status={task.status} /></DetailRow>
              <DetailRow label="Priority"><PriorityBadge priority={task.priority} /></DetailRow>
              <DetailRow label="Due date">
                <span className={task.isOverdue ? 'font-medium text-red-600' : ''}>{formatDate(task.dueDate)}</span>
              </DetailRow>
              <DetailRow label="Created">{formatDateTime(task.createdAt)}</DetailRow>
              <DetailRow label="Last updated">{formatDateTime(task.updatedAt)}</DetailRow>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Quick status update</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => changeStatus(s.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-inset transition-colors disabled:opacity-60 ${
                    task.status === s.value ? `${s.badge} ring-2` : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                  }`}
                  aria-pressed={task.status === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {statusError && <p className="mt-2 text-xs text-red-600">{statusError}</p>}
          </section>
        </aside>
      </div>

      {editing && (
        <TaskFormModal
          task={task}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            reload()
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task"
          message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
          onClose={() => setDeleting(false)}
          onConfirm={async () => {
            await tasksApi.remove(task.id)
            navigate('/tasks', { replace: true })
          }}
        />
      )}
    </>
  )
}
