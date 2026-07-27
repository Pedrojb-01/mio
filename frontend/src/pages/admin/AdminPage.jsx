import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Toast from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import { adminApi } from '../../api/admin.js'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRelativeDate(dateString) {
  const now      = new Date()
  const date     = new Date(dateString)
  const diffMs   = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0)  return 'Today'
  if (diffDays === 1)  return 'Yesterday'
  if (diffDays < 30)   return `${diffDays} days ago`
  if (diffDays < 365)  return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold text-primary">{value ?? '—'}</p>
    </div>
  )
}

// ─── Stats tab ────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: 'Today',      value: 'today' },
  { label: 'Last 7 days', value: '7d'   },
  { label: 'Last 30 days', value: '30d' },
  { label: 'All time',   value: 'all'   },
]

function StatsTab() {
  const [stats, setStats]         = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)
  const [period, setPeriod]       = useState('7d')

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await adminApi.getStats(period)
        setStats(data.stats)
      } catch (err) {
        setError(err.isAppError ? err.message : 'Failed to load stats. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [period])

  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-2xl p-5">
          <div className="h-3 w-20 bg-border rounded animate-pulse mb-3" />
          <div className="h-7 w-12 bg-border rounded animate-pulse" />
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
      {error}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-primary mb-1">New users</p>
            <p className="text-xs text-muted">{PERIODS.find(p => p.value === period)?.label}</p>
          </div>
          <div className="relative">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="text-xs text-primary bg-surface border border-border rounded-lg
                pl-3 pr-8 py-1.5 outline-none cursor-pointer appearance-none"
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-muted">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={stats.chartData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>yy
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              tickFormatter={d => d.split(',')[0]}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--color-primary)',
              }}
              formatter={(value) => [value, 'New users']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#800020"
              strokeWidth={2}
              dot={{ r: 3, fill: '#800020', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#800020', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cards — Users */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total"              value={stats.users.total} />
          <StatCard label="Active"             value={stats.users.active} />
          <StatCard label="Blocked"            value={stats.users.blocked} />
          <StatCard label="Onboarding complete" value={stats.users.onboardingComplete} />
        </div>
      </div>

      {/* Cards — Sessions */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Sessions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total"       value={stats.sessions.total} />
          <StatCard label="Brainstorm"  value={stats.sessions.brainstorm} />
          <StatCard label="Creation"    value={stats.sessions.creation} />
        </div>
      </div>

      {/* Cards — Messages */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Messages</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total generated" value={stats.messages.total} />
        </div>
      </div>

    </div>
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UserRow({ user, onStatusChange, onDelete, isUpdating, isDeleting }) {
  const isAdmin   = user.role === 'admin'
  const isBlocked = user.status === 'blocked'

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-white">{initials}</span>
      </div>
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
      {!isAdmin && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            isLoading={isUpdating}
            disabled={isUpdating || isDeleting}
            onClick={() => onStatusChange(user.id, isBlocked ? 'active' : 'blocked')}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isDeleting}
            disabled={isUpdating || isDeleting}
            onClick={() => onDelete(user.id, user.name)}
            className="text-red-500 hover:text-red-600"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}

function DeleteModal({ userName, onConfirm, onCancel, isLoading }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onCancel() }}
      />
      <div
        className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-primary mb-1">Delete user?</h2>
        <p className="text-sm text-muted mb-6">
          <span className="font-medium text-primary">"{userName}"</span> and all their data will be permanently deleted.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary
              bg-surface border border-border hover:brightness-110
              transition-colors duration-150 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white
              bg-red-500 hover:bg-red-600 transition-colors duration-150
              disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function UsersTab() {
  const [users, setUsers]               = useState([])
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState(null)
  const [updatingId, setUpdatingId]     = useState(null)
  const [deletingId, setDeletingId]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }
  const [toast, setToast]               = useState(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await adminApi.listUsers()
        setUsers(data.users)
      } catch (err) {
        setError(err.isAppError ? err.message : 'Failed to load users. Please refresh the page.')
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
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: data.user.status } : u))
      setToast({
        message: newStatus === 'blocked' ? 'User blocked successfully.' : 'User unblocked successfully.',
        type: 'success',
      })
    } catch (err) {
      setToast({
        message: err.isAppError ? err.message : 'Failed to update user. Please try again.',
        type: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

async function handleDelete(userId) {
    setDeletingId(userId)
    try {
      await adminApi.deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setToast({ message: 'User deleted successfully.', type: 'success' })
    } catch (err) {
      setToast({
        message: err.isAppError ? err.message : 'Failed to delete user. Please try again.',
        type: 'error',
      })
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const totalUsers   = users.filter(u => u.role !== 'admin').length
  const blockedUsers = users.filter(u => u.role !== 'admin' && u.status === 'blocked').length

  return (
    <>
      <p className="text-sm text-muted mb-6">
        {totalUsers} {totalUsers === 1 ? 'user' : 'users'} · {blockedUsers} blocked
      </p>

      {error && (
        <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50
          border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

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

      {!isLoading && users.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-12 w-12 rounded-2xl bg-soft flex items-center justify-center mb-4">
            <span className="text-xl">👥</span>
          </div>
          <h3 className="text-sm font-semibold text-primary mb-1">No users yet</h3>
          <p className="text-sm text-muted">Users will appear here once they register.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl px-6">
          {users.map(user => (
            <UserRow
              key={user.id}
              user={user}
              onStatusChange={handleStatusChange}
              onDelete={(id, name) => setConfirmDelete({ id, name })}
              isUpdating={updatingId === user.id}
              isDeleting={deletingId === user.id}
            />
          ))}
        </div>
      )}

      {confirmDelete && (
        <DeleteModal
          userName={confirmDelete.name}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          isLoading={!!deletingId}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

const TABS = ['Users', 'Stats']

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Users')

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-primary">Admin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-soft rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer
                ${activeTab === tab
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-muted hover:text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'Users' && <UsersTab />}
        {activeTab === 'Stats' && <StatsTab />}

      </div>
    </DashboardLayout>
  )
}