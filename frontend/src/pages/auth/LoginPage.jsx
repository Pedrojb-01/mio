import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { validateEmail, validatePassword, sanitizeField } from '../../utils/sanitize.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [fields, setFields] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
    // Clear field error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    if (serverError)  setServerError(null)
  }

  function validate() {
    const emailError    = validateEmail(fields.email)
    const passwordError = validatePassword(fields.password)
    const next = {}
    if (emailError)    next.email    = emailError
    if (passwordError) next.password = passwordError
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setServerError(null)

    try {
      const credentials = {
        email:    sanitizeField(fields.email,    254),
        password: sanitizeField(fields.password, 128),
      }

      const profile = await login(credentials)

      // Backend returns profile after login:
      // onboardingComplete = false → first time user → onboarding
      // onboardingComplete = true  → returning user  → dashboard
      if (!profile?.onboardingComplete) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/dashboard/brainstorm', { replace: true })
      }
    } catch (error) {
      if (error.isAppError) {
        setServerError(error.message)
      } else {
        setServerError('Unexpected error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* Header */}
      <header className="px-8 py-5 border-b border-border bg-surface">
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-150"
        >
          <img src="/favicon.svg" alt="Mio" className="h-8 w-8 rounded-xl" />
          <span className="text-lg font-semibold tracking-tight text-primary">mio</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          <p className="mb-6 text-center text-sm text-muted">
            Sign in to your account
          </p>

          {/* Card */}
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
            {serverError && (
              <div role="alert" className="mb-5 px-4 py-3 rounded-lg bg-red-50
                border border-red-200 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                value={fields.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={fields.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={128}
                required
              />
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                fullWidth
                size="md"
              >
                Sign in
              </Button>
            </form>
          </div>

          {/* Footer link */}
          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}