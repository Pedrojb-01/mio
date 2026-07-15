import { api } from './client.js'

export const profileApi = {
  get:    ()     => api.get('/profile'),
  update: (body) => api.patch('/profile', body),
}

// Used only for session restore on app load — 401 means no session, not an error
export async function restoreSession() {
  const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'

  const response = await fetch(`${BASE_URL}/profile`, {
    credentials: 'include',
  })

  if (!response.ok) return null
  return response.json()
}