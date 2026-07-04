import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10)

    // Start exit after 3s
    const exitTimer = setTimeout(() => {
      setVisible(false)
      // Wait for animation to finish before unmounting
      setTimeout(onClose, 300)
    }, 3000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [])

  const styles = {
    success: 'bg-white border-green-200 text-green-700',
    error:   'bg-white border-red-200 text-red-600',
  }

  const icons = {
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeLinejoin="round" className="text-green-500 shrink-0" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeLinejoin="round" className="text-red-500 shrink-0" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-3 px-4 py-3
        rounded-xl border shadow-lg text-sm font-medium
        transition-all duration-300
        ${styles[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {icons[type]}
      {message}
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="ml-1 text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}