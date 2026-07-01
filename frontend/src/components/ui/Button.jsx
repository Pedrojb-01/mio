export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
}) {
  const base = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-colors duration-150 focus:outline-none
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary:   'bg-accent text-white hover:bg-accent-hover',
    secondary: 'border border-border text-primary bg-white hover:bg-surface',
    ghost:     'text-muted hover:text-primary hover:bg-surface',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}