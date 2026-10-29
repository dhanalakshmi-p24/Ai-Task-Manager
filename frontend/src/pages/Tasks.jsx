import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { tasksApi } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/Feedback'
import { buttonStyles } from '../lib/styles'
import { OverdueBadge, PriorityBadge, StatusBadge } from '../components/Badges'
import TaskFormModal from '../components/TaskFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PRIORITIES, STATUSES, formatDate } from '../lib/constants'

const selectClass =
  'rounded-lg border-0 py-2 pl-3 pr-8 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600'

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onEdit} className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50">Edit</button>
      <button type="button" onClick={onDelete} className="rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
    </div>
  )
}

export default function Tasks() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  // null = closed, {} = new, task = edit. "?new=1" (from the dashboard button) opens the create form.
  const [editing, setEditing] = useState(() => (searchParams.get('new') === '1' ? {} : null))
  const [deleting, setDeleting] = useState(null)
  const debouncedSearch = useDebounced(search)

  const { data: tasks, loading, error, reload } = useAsync(
    () => tasksApi.list({ status, priority, search: debouncedSearch.trim() }),
    [status, priority, debouncedSearch],
  )

  // Drop the one-shot "?new=1" flag so refreshing the page does not reopen the form.
  useEffect(() => {
    if (searchParams.has('new')) setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const hasFilters = Boolean(search || status || priority)
  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle={tasks ? `${tasks.length} task${tasks.length === 1 ? '' : 's'}${hasFilters ? ' matching filters' : ''}` : 'Manage all tasks'}
        actions={<button type="button" className={buttonStyles.primary} onClick={() => setEditing({})}>+ New task</button>}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or description…"
          className="w-full flex-1 rounded-lg border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600"
          aria-label="Search tasks"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass} aria-label="Filter by priority">
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-slate-500 hover:text-slate-700">Clear</button>
        )}
      </div>

      {loading && !tasks && <Spinner label="Loading tasks…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {tasks && tasks.length === 0 && (
        <EmptyState
          title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
          description={hasFilters ? 'Try adjusting the search or filters.' : 'Create your first task to get started.'}
          action={hasFilters
            ? <button type="button" className={buttonStyles.secondary} onClick={clearFilters}>Clear filters</button>
            : <button type="button" className={buttonStyles.primary} onClick={() => setEditing({})}>+ New task</button>}
        />
      )}

      {tasks && tasks.length > 0 && (
        <div className={loading ? 'opacity-60 transition-opacity' : ''}>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Due date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/tasks/${task.id}`)}>
                    <td className="max-w-md px-5 py-3">
                      <Link to={`/tasks/${task.id}`} onClick={(e) => e.stopPropagation()} className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-600">
                        {task.title}
                      </Link>
                      {task.description && <p className="truncate text-xs text-slate-500">{task.description}</p>}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-3 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        {formatDate(task.dueDate)}
                        {task.isOverdue && <OverdueBadge />}
                      </div>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <RowActions onEdit={() => setEditing(task)} onDelete={() => setDeleting(task)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Link to={`/tasks/${task.id}`} className="block">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  {task.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>}
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.isOverdue && <OverdueBadge />}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Due {formatDate(task.dueDate)}</span>
                  <RowActions onEdit={() => setEditing(task)} onDelete={() => setDeleting(task)} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && (
        <TaskFormModal
          task={editing.id ? editing : undefined}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task"
          message={`Are you sure you want to delete "${deleting.title}"? This cannot be undone.`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await tasksApi.remove(deleting.id)
            setDeleting(null)
            reload()
          }}
        />
      )}
    </>
  )
}
