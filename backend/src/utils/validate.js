// Input validation helpers — mirrors frontend sanitize.js limits.
// Each function returns an error message string, or null if valid.

function validateRequiredString(value, fieldName, maxLength) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return `${fieldName} is required`;
  }
  if (value.trim().length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }
  return null;
}

function validateOptionalString(value, fieldName, maxLength) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return `${fieldName} must be a string`;
  if (value.length > maxLength) return `${fieldName} must be at most ${maxLength} characters`;
  return null;
}

function validateEmail(value) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return 'Email is required';
  }
  if (value.trim().length > 254) return 'Email must be at most 254 characters';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value.trim())) return 'Enter a valid email address';
  return null;
}

function validatePassword(value) {
  if (!value || typeof value !== 'string') return 'Password is required';
  if (value.length < 8)   return 'Password must be at least 8 characters';
  if (value.length > 128) return 'Password must be at most 128 characters';
  return null;
}

module.exports = { validateRequiredString, validateOptionalString, validateEmail, validatePassword };