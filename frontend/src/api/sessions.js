import { api } from './client.js'

export const sessionsApi = {
  list: ()                    => api.get('/sessions'),
  create: (body)              => api.post('/sessions', body),
  get: (id)                   => api.get(`/sessions/${id}`),
  rename: (id, title)         => api.patch(`/sessions/${id}`, { title }),
  remove: (id)                => api.delete(`/sessions/${id}`),
}