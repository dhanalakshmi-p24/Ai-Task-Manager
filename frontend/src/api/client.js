const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// ASP.NET Core may key validation errors as "Title" or "$.title"; normalise to camelCase field names.
function normaliseFieldErrors(errors = {}) {
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => {
      const field = key.replace(/^\$\./, '')
      return [field.charAt(0).toLowerCase() + field.slice(1), messages.join(' ')]
    }),
  )
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Is the backend running?', 0)
  }

  if (response.status === 204) return null

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.detail || body?.title || `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, normaliseFieldErrors(body?.errors))
  }
  return body
}

export const tasksApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v))
    const qs = params.toString()
    return request(`/api/tasks${qs ? `?${qs}` : ''}`)
  },
  get: (id) => request(`/api/tasks/${id}`),
  create: (task) => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, task) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
}

export const teamMembersApi = {
  list: () => request('/api/team-members'),
}

export const dashboardApi = {
  stats: () => request('/api/dashboard/stats'),
}
