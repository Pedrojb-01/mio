import { api } from './client.js'

export const adminApi = {
  listUsers:        ()           => api.get('/admin/users'),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
}