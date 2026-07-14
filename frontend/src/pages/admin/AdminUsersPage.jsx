import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Toast from '../../components/ui/Toast.jsx'
import { adminApi } from '../../api/admin.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRelativeDate(dateString) {
  const now     = new Date()
  const date    = new Date(dateString)
  const diffMs  = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0)  return 'Today'
  if (diffDays === 1)  return 'Yesterday'
  if (diffDays < 30)   return `${diffDays} days ago`
  if (diffDays < 365)  return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user, onStatusChange, isUpdating }) {
  const isAdmin   = user.role === 'admin'
  const isBlocked = user.status === 'blocked'

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">

      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-white">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-primary truncate">{user.name}</p>
          {isAdmin && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full
              text-xs font-medium bg-soft text-accent">
              Admin
            </span>
          )}
          {isBlocked && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full
              text-xs font-medium bg-red-50 text-red-600">
              Blocked
            </span>
          )}
        </div>
        <p className="text-xs text-muted truncate">{user.email}</p>
        <p className="text-xs text-muted mt-0.5">Joined {getRelativeDate(user.createdAt)}</p>
      </div>

      {/* Action */}
      {!isAdmin && (
        <Button
          variant="secondary"
          size="sm"
          isLoading={isUpdating}
          disabled={isUpdating}
          onClick={() => onStatusChange(user.id, isBlocked ? 'active' : 'blocked')}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </Button>
      )}
    </div>
  )
}

// ─── AdminUsersPage ───────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers]         = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast]         = useState(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await adminApi.listUsers()
        setUsers(data.users)
      } catch (error) {
        setError(
          error.isAppError
            ? error.message
            : 'Failed to load users. Please refresh the page.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  async function handleStatusChange(userId, newStatus) {
    setUpdatingId(userId)
    try {
      const data = await adminApi.updateUserStatus(userId, newStatus)
      // Update only the affected user in local state — no full refetch
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, status: data.user.status } : u)
      )
      setToast({
        message: newStatus === 'blocked' ? 'User blocked successfully.' : 'User unblocked successfully.',
        type: 'success',
      })
    } catch (error) {
      setToast({
        message: error.isAppError ? error.message : 'Failed to update user. Please try again.',
        type: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const totalUsers   = users.filter(u => u.role !== 'admin').length
  const blockedUsers = users.filter(u => u.role !== 'admin' && u.status === 'blocked').length

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-primary">User Management</h1>
          <p className="text-sm text-muted mt-0.5">
            {totalUsers} {totalUsers === 1 ? 'user' : 'users'} ·{' '}
            {blockedUsers} blocked
          </p>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50
            border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="bg-surface border border-border rounded-2xl px-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                <div className="h-9 w-9 rounded-full bg-border animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3.5 w-32 bg-border rounded animate-pulse" />
                  <div className="h-3 w-48 bg-border rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-border rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && users.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-12 w-12 rounded-2xl bg-soft flex items-center justify-center mb-4">
              <span className="text-xl">👥</span>
            </div>
            <h3 className="text-sm font-semibold text-primary mb-1">No users yet</h3>
            <p className="text-sm text-muted">Users will appear here once they register.</p>
          </div>
        )}

        {/* User list */}
        {!isLoading && users.length > 0 && (
          <div className="bg-surface border border-border rounded-2xl px-6">
            {users.map(user => (
              <UserRow
                key={user.id}
                user={user}
                onStatusChange={handleStatusChange}
                isUpdating={updatingId === user.id}
              />
            ))}
          </div>
        )}

      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </DashboardLayout>
  )
}