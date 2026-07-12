import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconBrainstorm() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function IconCreate() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconMemory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <IconBrainstorm />,
    title: 'Brainstorm with context',
    description:
      'Mio knows your niche, your audience and your brand — every idea it generates is tailored to your business, not a generic prompt.',
  },
  {
    icon: <IconCreate />,
    title: 'Write in your voice',
    description:
      'Define your tone once during setup. Every Instagram post Mio writes sounds like you — professional, casual, inspirational or whatever fits your brand.',
  },
  {
    icon: <IconMemory />,
    title: 'Remembers everything',
    description:
      'Your sessions are saved and organized. Pick up where you left off, revisit old ideas and build on previous conversations.',
  },
]

const DIFFERENTIATORS = [
  'Knows your business from day one',
  'Generates content in your brand voice',
  'Saves and organizes every session',
  'Built exclusively for Instagram',
  'No generic prompts, no repetition',
]

const CHAT_PREVIEW = [
  {
    role: 'user',
    content: 'I need 3 hook ideas for a post about my new handmade jewelry collection.',
  },
  {
    role: 'assistant',
    content: `Here are 3 hooks for Studio Bloom's new collection:\n\n1. "Handmade doesn't mean ordinary — meet the pieces that prove it."\n2. "Every detail has a story. Here's ours."\n3. "Your next favorite piece is already made. You just haven't seen it yet."`,
  },
]

// ─── Components ──────────────────────────────────────────────────────────────

const TYPING_SPEED    = 50   // ms per character
const PAUSE_AFTER_USER = 800  // ms before AI starts typing
const PAUSE_DOTS       = 1200 // ms showing typing dots

function ChatPreview() {
  const [phase, setPhase]         = useState('idle')    // idle | user | dots | ai | done
  const [userText, setUserText]   = useState('')
  const [aiText, setAiText]       = useState('')

  const fullUser = CHAT_PREVIEW[0].content
  const fullAi   = CHAT_PREVIEW[1].content

  useEffect(() => {
    let timeout
    let interval
    let index = 0

    // Phase 1: type user message
    setPhase('user')
    setUserText('')
    setAiText('')

    interval = setInterval(() => {
      index++
      setUserText(fullUser.slice(0, index))
      if (index >= fullUser.length) {
        clearInterval(interval)

        // Phase 2: show dots
        timeout = setTimeout(() => {
          setPhase('dots')

          // Phase 3: type AI response
          timeout = setTimeout(() => {
            setPhase('ai')
            index = 0
            interval = setInterval(() => {
              index++
              setAiText(fullAi.slice(0, index))
              if (index >= fullAi.length) {
                clearInterval(interval)
                setPhase('done')
              }
            }, TYPING_SPEED)
          }, PAUSE_DOTS)
        }, PAUSE_AFTER_USER)
      }
    }, TYPING_SPEED)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">

      {/* Fake header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-300" />
          <div className="h-3 w-3 rounded-full bg-yellow-300" />
          <div className="h-3 w-3 rounded-full bg-green-300" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-xs text-muted font-medium">Mio — Brainstorm</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4 p-5 min-h-[280px]">

        {/* User message */}
        {userText && (
          <div className="flex justify-end">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm
              text-sm leading-relaxed bg-accent text-white whitespace-pre-wrap">
              {userText}
              {phase === 'user' && (
                <span className="inline-block w-0.5 h-3.5 bg-white/70 ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        )}

        {/* Typing dots */}
        {phase === 'dots' && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <div className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* AI message */}
        {aiText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm
              text-sm leading-relaxed bg-surface border border-border text-primary whitespace-pre-wrap">
              {aiText}
              {phase === 'ai' && (
                <span className="inline-block w-0.5 h-3.5 bg-primary/50 ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── LandingPage ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm
        border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Mio" className="h-7 w-7 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight text-primary">mio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-muted hover:text-primary
                transition-colors duration-150"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm
                font-medium bg-accent text-white hover:bg-accent-hover
                transition-colors duration-150"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs
              font-medium bg-soft text-accent border border-accent/20 mb-6">
              Built for Instagram entrepreneurs
            </span>

            <h1 className="text-4xl font-semibold text-primary leading-tight tracking-tight mb-5">
              Your content.{' '}
              <span className="text-accent">Your voice.</span>{' '}
              Scaled by AI.
            </h1>

            <p className="text-base text-muted leading-relaxed mb-8">
              Mio is an AI content assistant that knows your business,
              remembers what you've already created, and helps you generate
              ideas and write posts — in your tone, for your audience.
            </p>

            {/* Differentiators */}
            <ul className="flex flex-col gap-2.5 mb-8">
              {DIFFERENTIATORS.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-primary">
                  <span className="h-5 w-5 rounded-full bg-soft text-accent
                    flex items-center justify-center shrink-0">
                    <IconCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <Link
                to="/register"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm
                  font-medium bg-accent text-white hover:bg-accent-hover
                  transition-colors duration-150"
              >
                Start for free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm
                  font-medium border border-border text-primary bg-white
                  hover:bg-surface transition-colors duration-150"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Right — chat preview */}
          <div className="lg:block">
            <ChatPreview />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-primary tracking-tight mb-3">
              ChatGPT doesn't know your business.
            </h2>
            <p className="text-muted text-sm max-w-lg mx-auto">
              Generic AI gives generic results. Mio is built around your brand —
              from the first setup to every session.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-surface
                hover:border-accent/30 transition-colors duration-200">
                <div className="h-10 w-10 rounded-xl bg-soft text-accent
                  flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-primary tracking-tight mb-3">
          Ready to scale your content?
        </h2>
        <p className="text-sm text-muted mb-7 max-w-sm mx-auto">
          Set up your workspace in 2 minutes and start creating content
          that sounds like you.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 rounded-lg text-sm
            font-medium bg-accent text-white hover:bg-accent-hover
            transition-colors duration-150"
        >
          Get started for free
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Mio" className="h-6 w-6 rounded-lg" />
            <span className="text-sm font-medium text-primary">mio</span>
          </div>
          <p className="text-xs text-muted">
            Built for the IBM SkillsBuild AI Builders Challenge · 2026
          </p>
        </div>
      </footer>

    </div>
  )
}