// React escapes HTML by default in JSX — {variable} is already safe.
// This file adds a second layer for two specific cases:
//   1. Values sent to the API (strip tags before they reach the server)
//   2. Any future use of dangerouslySetInnerHTML (chat markdown, etc.)

// Strips HTML tags and trims whitespace
export function sanitizeText(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')  // strip HTML tags: <script>, <img>, etc.
    .replace(/&[^;]+;/g, '')  // strip HTML entities: &lt; &gt; &#x27; etc.
    .trim()
}

// Sanitize + enforce max length in one call
// Used right before sending form data to the API
export function sanitizeField(value, maxLength) {
  const clean = sanitizeText(value)
  return maxLength ? clean.slice(0, maxLength) : clean
}

// ─── Form validators ─────────────────────────────────────────────────────────
// Each returns an error string if invalid, or null if valid.
// Components call these before submitting — never trust the HTML maxLength alone.

export function validateEmail(email) {
  const clean = sanitizeText(email)
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!clean)               return 'Email is required'
  if (clean.length > 254)   return 'Email is too long'
  if (!pattern.test(clean)) return 'Enter a valid email address'
  return null
}

export function validatePassword(password) {
  if (!password)              return 'Password is required'
  if (password.length < 8)   return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'
  return null
}

export function validateName(value) {
  const clean = sanitizeText(value)
  if (!clean)             return 'Name is required'
  if (clean.length < 2)  return 'Name must be at least 2 characters'
  if (clean.length > 64) return 'Name is too long'
  return null
}

export function validateRequired(value, fieldName) {
  const clean = sanitizeText(value)
  if (!clean) return `${fieldName} is required`
  return null
}

export function validateMaxLength(value, fieldName, max) {
  const clean = sanitizeText(value)
  if (clean.length > max) return `${fieldName} must be at most ${max} characters`
  return null
}