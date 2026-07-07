import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sessionsApi } from '../../api/sessions.js'
import { streamMessage } from '../../api/messages.js'
import { sanitizeField } from '../../utils/sanitize.js'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function IconSend({ disabled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      className={disabled ? 'text-muted' : 'text-white'}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function IconSpinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24"
      aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden
        ${isUser
          ? 'bg-accent text-white rounded-br-sm'
          : 'bg-white border border-border text-primary rounded-bl-sm'
        }
      `}>
        {content}
      </div>
    </div>
  )
}

// ─── ChatPage ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { id }     = useParams()
  const navigate    = useNavigate()

  const [session, setSession]     = useState(null)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError]         = useState(null)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const MAX_LENGTH = 2000

  // ─── Load session + history ─────────────────────────────────────────────────

  useEffect(() => {
    async function loadChat() {
      try {
        const data = await sessionsApi.get(id)
        setSession(data.session)
        setMessages(data.messages)  // ← já vem junto
      } catch {
        setError('Failed to load chat. Please go back and try again.')
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadChat()
  }, [id])

  // ─── Auto-scroll to bottom on new messages ──────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [input])

  // ─── Send message ───────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const clean = sanitizeField(input, MAX_LENGTH).trim()
    if (!clean || isStreaming) return

    setInput('')
    setError(null)

    // Optimistically add user message to UI
    const userMessage = { role: 'user', content: clean, id: `temp-${Date.now()}` }
    setMessages(prev => [...prev, userMessage])

    // Placeholder for the assistant's streaming response
    const assistantPlaceholder = { role: 'assistant', content: '', id: `streaming-${Date.now()}` }
    setMessages(prev => [...prev, assistantPlaceholder])

    setIsStreaming(true)

    streamMessage({
      sessionId: id,
      content:   clean,
      onChunk: (text) => {
        // Append each chunk to the last message (the assistant placeholder)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + text,
          }
          return updated
        })
      },
      onTitle: (title) => {
        setSession(prev => ({ ...prev, title }))
        // Notify sidebar to refresh sessions
        window.dispatchEvent(new CustomEvent('session-title-updated'))
      },
      onDone: () => {
        setIsStreaming(false)
        inputRef.current?.focus()
      },
      onError: (message) => {
        // Remove the empty assistant placeholder on error
        setMessages(prev => prev.filter(m => !m.id?.startsWith('streaming-')))
        setError(message)
        setIsStreaming(false)
        inputRef.current?.focus()
      },
    })
  }, [input, isStreaming, id])

  // Send on Enter (Shift+Enter = new line)
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── Back navigation ────────────────────────────────────────────────────────

  function handleBack() {
    const route = session?.mode === 'brainstorm'
      ? '/dashboard/brainstorm'
      : '/dashboard/create'
    navigate(route)
  }

  const canSend = input.trim().length > 0 && !isStreaming

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen">

        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 px-6 py-4
          border-b border-border bg-white">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="p-1.5 rounded-lg text-muted hover:text-primary
              hover:bg-surface transition-colors duration-150"
          >
            <IconArrowLeft />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-primary truncate">
              {session?.title ?? 'New session'}
            </h1>
            <p className="text-xs text-muted">
              {session?.mode === 'brainstorm' ? 'Brainstorm' : 'Create Post'}
            </p>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">

            {/* Loading history */}
            {isLoadingHistory && (
              <div className="flex justify-center py-12">
                <IconSpinner />
              </div>
            )}

            {/* Error loading chat */}
            {error && !isStreaming && (
              <div role="alert" className="px-4 py-3 rounded-lg bg-red-50
                border border-red-200 text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Empty state — new session */}
            {!isLoadingHistory && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 rounded-2xl bg-soft flex items-center
                  justify-center mb-4">
                  <span className="text-xl">
                    {session?.mode === 'brainstorm' ? '💡' : '✏️'}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-primary mb-1">
                  {session?.mode === 'brainstorm'
                    ? 'Start brainstorming'
                    : 'Start creating'}
                </h2>
                <p className="text-sm text-muted max-w-xs">
                  {session?.mode === 'brainstorm'
                    ? 'Ask Mio for content ideas, angles, hooks or anything to spark creativity.'
                    : 'Describe the post you want and Mio will write it in your brand voice.'}
                </p>
              </div>
            )}

            {/* Message list */}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id ?? index}
                role={message.role}
                content={message.content}
              />
            ))}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 px-6 py-4">
          <div className="max-w-2xl mx-auto">

            {/* Streaming error */}
            {error && isStreaming === false && messages.length > 0 && (
              <p role="alert" className="text-xs text-red-500 mb-2 text-center">
                {error}
              </p>
            )}

            <div
              onClick={() => inputRef.current?.focus()}
              className={`bg-surface border rounded-xl px-4 py-2 cursor-text
                transition-colors duration-150
                ${isStreaming ? 'border-border' : 'border-border focus-within:border-accent'}`}>

              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  session?.mode === 'brainstorm'
                    ? 'Ask for ideas, topics, hooks...'
                    : 'Describe the post you want...'
                }
                disabled={isStreaming || isLoadingHistory}
                maxLength={MAX_LENGTH}
                rows={1}
                className="w-full bg-transparent text-sm text-primary placeholder:text-muted
                  resize-none outline-none max-h-72 overflow-y-auto
                  disabled:cursor-not-allowed py-2"
                style={{ scrollbarWidth: 'thin' }}
              />

              {/* Send button */}
              <div className="flex justify-end pb-1">
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  aria-label="Send message"
                  className={`
                    shrink-0 h-8 w-8 rounded-lg flex items-center justify-center
                    transition-colors duration-150
                    ${canSend
                      ? 'bg-accent hover:bg-accent-hover cursor-pointer'
                      : 'bg-border cursor-not-allowed'
                    }
                  `}
                >
                  {isStreaming ? <IconSpinner /> : <IconSend disabled={!canSend} />}
                </button>
              </div>
            </div>

            <div className="relative mt-2">
              <p className="text-xs text-muted text-center">
                Enter to send · Shift+Enter for new line
              </p>
              {input.length > MAX_LENGTH * 0.8 && (
                <span className={`absolute right-0 top-0 text-xs ${
                  input.length >= MAX_LENGTH ? 'text-red-500' : 'text-muted'
                }`}>
                  {input.length}/{MAX_LENGTH}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}