import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { sessionsApi } from '../../api/sessions.js'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconBrainstorm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function IconCreate() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconSession() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function IconChevron({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserMenu({ user }) {
  const { logout }       = useAuth()
  const navigate          = useNavigate()
  const [open, setOpen]   = useState(false)
  const menuRef           = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return ()  => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  // Initials from user name: "Pedro Silva" → "PS"
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
          hover:bg-surface transition-colors duration-150 text-left"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{user.name}</p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>

        <IconChevron open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-border
            rounded-xl shadow-lg py-1 z-50"
        >
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary
              hover:bg-surface transition-colors duration-150"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary
              hover:bg-surface transition-colors duration-150"
          >
            Settings
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500
              hover:bg-red-50 transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user }               = useAuth()
  const [sessions, setSessions] = useState([])
  const location               = useLocation()
  const activeChatId           = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/chat/')[1]
    : null

  // Fetch recent sessions for the sidebar (last 5)
  useEffect(() => {
    async function fetchRecent() {
      try {
        const data = await sessionsApi.list()
        setSessions(data.sessions.slice(0, 5))
      } catch {
        // Non-critical
      }
    }

    fetchRecent()

    window.addEventListener('session-title-updated', fetchRecent)
    window.addEventListener('session-updated', fetchRecent)
    return () => {
      window.removeEventListener('session-title-updated', fetchRecent)
      window.removeEventListener('session-updated', fetchRecent)
    }
  }, [])

  const navLinkClass = ({ isActive }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
    transition-colors duration-150
    ${isActive
      ? 'bg-soft text-accent'
      : 'text-muted hover:text-primary hover:bg-surface'
    }
  `

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col
      border-r border-border bg-white px-3 py-4">

      {/* Logo */}
      <div className="px-3 mb-6">
        <span className="text-xl font-semibold tracking-tight text-primary">mio</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        <NavLink to="/dashboard/brainstorm" className={navLinkClass}>
          <IconBrainstorm />
          Brainstorm
        </NavLink>
        <NavLink to="/dashboard/create" className={navLinkClass}>
          <IconCreate />
          Create Post
        </NavLink>
      </nav>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="mt-6">
          <p className="px-3 mb-1.5 text-xs font-medium text-muted uppercase tracking-wider">
            Recent
          </p>
          <div className="flex flex-col gap-0.5">
            {sessions.map(session => (
              <Link
                key={session.id}
                to={`/chat/${session.id}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                  transition-colors duration-150 truncate
                  ${activeChatId === session.id
                    ? 'bg-soft text-accent font-medium'
                    : 'text-muted hover:text-primary hover:bg-surface'
                  }`}
              >
                <IconSession />
                <span className="truncate">{session.title ?? 'Untitled session'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu at the bottom */}
      {user && <UserMenu user={user} />}
    </aside>
  )
}