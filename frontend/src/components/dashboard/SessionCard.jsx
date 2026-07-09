import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionsApi } from '../../api/sessions.js'
import { sanitizeField } from '../../utils/sanitize.js'

function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
    </svg>
  )
}

function getRelativeDate(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1)    return 'Just now'
  if (diffMins < 60)   return `${diffMins}m ago`
  if (diffHours < 24)  return `${diffHours}h ago`
  if (diffDays === 1)  return 'Yesterday'
  if (diffDays < 7)    return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SessionCard({ session, onDelete, onRename }) {
  const navigate               = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle]       = useState(session.title ?? 'Untitled session')
  const menuRef                 = useRef(null)
  const inputRef                = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Focus input when rename starts
  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  async function handleRename() {
    const clean = sanitizeField(title, 100).trim()
    if (!clean) { setTitle(session.title ?? 'Untitled session'); setRenaming(false); return }
    if (clean === session.title) { setRenaming(false); return }
    try {
      await sessionsApi.rename(session.id, clean)
      onRename(session.id, clean)
      window.dispatchEvent(new CustomEvent('session-updated'))
    } catch {
      setTitle(session.title ?? 'Untitled session')
    }
    setRenaming(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter')  handleRename()
    if (e.key === 'Escape') { setTitle(session.title ?? 'Untitled session'); setRenaming(false) }
  }

  async function handleDelete() {
    setMenuOpen(false)
    try {
      await sessionsApi.remove(session.id)
      onDelete(session.id)
      window.dispatchEvent(new CustomEvent('session-updated'))
    } catch { /* silent — card stays */ }
  }

  const date = getRelativeDate(session.lastInteraction)

  return (
    <div
      onClick={() => !renaming && !menuOpen && navigate(`/chat/${session.id}`)}
      className="group relative bg-white border border-border rounded-xl p-5
        hover:border-accent/40 hover:shadow-sm transition-all duration-150 cursor-pointer"
    >
      {/* Mode badge */}
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3
        ${session.mode === 'brainstorm'
          ? 'bg-soft text-accent'
          : 'bg-blue-50 text-blue-600'
        }`}>
        {session.mode === 'brainstorm' ? 'Brainstorm' : 'Create Post'}
      </span>

      {/* Title */}
      {renaming ? (
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          maxLength={100}
          onClick={e => e.stopPropagation()}
          className="w-full text-sm font-semibold text-primary bg-transparent border-b
            border-accent outline-none pb-0.5 mb-2"
        />
      ) : (
        <p className="text-sm font-semibold text-primary mb-2 truncate pr-6">
          {title}
        </p>
      )}

      {/* Date */}
      <p className="text-xs text-muted">{date}</p>

      {/* Options menu */}
      <div
        ref={menuRef}
        className="absolute top-4 right-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Session options"
          className="p-1 rounded-md text-muted hover:text-primary hover:bg-surface
            opacity-0 group-hover:opacity-100 transition-all duration-150"
        >
          <IconDots />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 w-36 bg-white border border-border
              rounded-xl shadow-lg py-1 z-10"
          >
            <button
              role="menuitem"
              onClick={() => { setMenuOpen(false); setRenaming(true) }}
              className="w-full px-4 py-2 text-sm text-left text-primary
                hover:bg-surface transition-colors duration-150"
            >
              Rename
            </button>
            <button
              role="menuitem"
              onClick={handleDelete}
              className="w-full px-4 py-2 text-sm text-left text-red-500
                hover:bg-red-50 transition-colors duration-150"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}