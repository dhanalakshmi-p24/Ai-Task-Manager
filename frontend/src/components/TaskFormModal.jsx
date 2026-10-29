import { useState } from 'react'
import Modal from './Modal'
import { buttonStyles } from '../lib/styles'
import { PRIORITIES, STATUSES } from '../lib/constants'
import { tasksApi } from '../api/client'

const EMPTY_TASK = { title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '' }

// Mirrors the server-side rules in TaskUpsertDto so users get instant feedback.
function validate(values) {
  const errors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Title is required.'
  else if (title.length < 3 || title.length > 200) errors.title = 'Title must be between 3 and 200 characters.'
  if (values.description.length > 2000) errors.description = 'Description cannot exceed 2000 characters.'
  if (!values.status) errors.status = 'Status is required.'
  if (!values.priority) errors.priority = 'Priority is required.'
  return errors
}

const inputClass = (hasError) =>
  `mt-1 block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset ${
    hasError ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-indigo-600'
  }`

function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

/** Create a task when `task` is omitted, otherwise edit it. Calls onSaved with the saved task. */
export default function TaskFormModal({ task, onClose, onSaved }) {
  const isEdit = Boolean(task)
  const [values, setValues] = useState(() =>
    task
      ? { title: task.title, description: task.description ?? '', status: task.status, priority: task.priority, dueDate: task.dueDate ?? '' }
      : EMPTY_TASK,
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const clientErrors = validate(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || null,
    }

    setSaving(true)
    setFormError(null)
    try {
      const saved = isEdit ? await tasksApi.update(task.id, payload) : await tasksApi.create(payload)
      onSaved(saved)
    } catch (err) {
      setErrors(err.fieldErrors ?? {})
      setFormError(err.status === 409 || !Object.keys(err.fieldErrors ?? {}).length ? err.message : 'Please fix the highlighted fields.')
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit task' : 'New task'} onClose={saving ? () => {} : onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

        <Field label="Title" htmlFor="title" error={errors.title}>
          <input id="title" type="text" value={values.title} onChange={update('title')} className={inputClass(errors.title)} placeholder="e.g. Prepare sprint demo" maxLength={200} autoFocus />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description}>
          <textarea id="description" rows={4} value={values.description} onChange={update('description')} className={inputClass(errors.description)} placeholder="Add more detail (optional)" />
          <p className="mt-1 text-right text-xs text-slate-400">{values.description.length}/2000</p>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="status" error={errors.status}>
            <select id="status" value={values.status} onChange={update('status')} className={inputClass(errors.status)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority" htmlFor="priority" error={errors.priority}>
            <select id="priority" value={values.priority} onChange={update('priority')} className={inputClass(errors.priority)}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Due date" htmlFor="dueDate" error={errors.dueDate}>
          <input id="dueDate" type="date" value={values.dueDate} onChange={update('dueDate')} className={inputClass(errors.dueDate)} />
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className={buttonStyles.secondary} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={buttonStyles.primary} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
