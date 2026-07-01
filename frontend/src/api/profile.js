import { api } from './client.js'

export const profileApi = {
  get:    ()     => api.get('/profile'),
  update: (body) => api.patch('/profile', body),
}