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
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-primary"
        >
          {label}
          {required && (
            <span className="text-accent ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <input
        id={id}
        name={id}
        type={type}
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
          w-full px-3.5 py-2.5 rounded-lg text-sm text-primary bg-white
          border transition-colors duration-150
          placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400' : 'border-border'}
        `}
      />

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