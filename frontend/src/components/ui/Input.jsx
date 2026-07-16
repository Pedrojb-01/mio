import { useState } from 'react'

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-medium text-primary">
            {label}
            {required && (
              <span className="text-accent ml-1" aria-hidden="true">*</span>
            )}
          </label>
          {maxLength && value?.length >= maxLength && (
            <span className="text-xs text-red-500">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}

    <div className="relative">
      <input
        id={id}
        name={id}
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`
          w-full px-3.5 py-2.5 rounded-lg text-sm text-primary bg-surface
          border transition-colors duration-150
          placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400' : 'border-border'}
          ${isPassword ? 'pr-10' : ''}
        `}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted
            hover:text-primary transition-colors duration-150"
        >
          {showPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      )}
    </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}