import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layout/DashboardLayout.jsx'
import SessionCard from './SessionCard.jsx'
import Button from '../ui/Button.jsx'
import { sessionsApi } from '../../api/sessions.js'

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function EmptyState({ mode, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-12 w-12 rounded-2xl bg-soft flex items-center justify-center mb-4">
        <span className="text-xl">{mode === 'brainstorm' ? '💡' : '✏️'}</span>
      </div>
      <h3 className="text-sm font-semibold text-primary mb-1">No sessions yet</h3>
      <p className="text-sm text-muted mb-5 max-w-xs">
        {mode === 'brainstorm'
          ? 'Start a brainstorm session to generate content ideas with Mio.'
          : 'Start a create session to write Instagram posts with Mio.'}
      </p>
      <Button onClick={onCreate} size="sm">
        <IconPlus />
        New session
      </Button>
    </div>
  )
}

export default function SessionsPage({ mode, title }) {
  const navigate                 = useNavigate()
  const [sessions, setSessions]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await sessionsApi.list()
        // Filter by mode — backend returns all sessions, we filter here
        setSessions(data.sessions.filter(s => s.mode === mode))
      } catch {
        setError('Failed to load sessions. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [mode])

  async function handleCreate() {
    setIsCreating(true)
    try {
      const data = await sessionsApi.create({ mode })
      navigate(`/chat/${data.session.id}`)
    } catch {
      setError('Failed to create session. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  function handleDelete(id) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  function handleRename(id, newTitle) {
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, title: newTitle } : s)
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-primary">{title}</h1>
            <p className="text-sm text-muted mt-0.5">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
            </p>
          </div>
          {sessions.length > 0 && (
            <Button onClick={handleCreate} isLoading={isCreating} disabled={isCreating} size="sm">
              <IconPlus />
              New session
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50 border
            border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-border rounded-xl
                animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && !error && (
          <EmptyState mode={mode} onCreate={handleCreate} />
        )}

        {/* Session cards */}
        {!isLoading && sessions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}