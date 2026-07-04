import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { profileApi } from '../api/profile.js'
import {
  sanitizeField,
  validateName,
  validateRequired,
  validateMaxLength,
} from '../utils/sanitize.js'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Textarea from '../components/ui/Textarea.jsx'
import Toast from '../components/ui/Toast.jsx'


const VOICE_TONES = [
  { value: 'professional',  label: 'Professional',  emoji: '💼' },
  { value: 'casual',        label: 'Casual',         emoji: '👋' },
  { value: 'inspirational', label: 'Inspirational',  emoji: '🚀' },
  { value: 'educational',   label: 'Educational',    emoji: '📚' },
  { value: 'humorous',      label: 'Humorous',       emoji: '😄' },
]

function Section({ title, description, children }) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-6 flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [fields, setFields] = useState({
    name:                user?.name                    ?? '',
    businessName:        profile?.businessName         ?? '',
    niche:               profile?.niche                ?? '',
    businessDescription: profile?.businessDescription  ?? '',
    targetAudience:      profile?.targetAudience       ?? '',
    differentiators:     profile?.differentiators      ?? '',
    voiceTone:           profile?.voiceTone            ?? '',
  })

  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState(null)
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)

  const hasChanges = useMemo(() => (
    fields.name                !== (user?.name                    ?? '') ||
    fields.businessName        !== (profile?.businessName         ?? '') ||
    fields.niche               !== (profile?.niche                ?? '') ||
    fields.businessDescription !== (profile?.businessDescription  ?? '') ||
    fields.targetAudience      !== (profile?.targetAudience       ?? '') ||
    fields.differentiators     !== (profile?.differentiators      ?? '') ||
    fields.voiceTone           !== (profile?.voiceTone            ?? '')
  ), [fields, user, profile])

  function handleChange(e) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    if (serverError)  setServerError(null)
  }

  function handleToneSelect(value) {
    setFields(prev => ({ ...prev, voiceTone: value }))
    if (errors.voiceTone) setErrors(prev => ({ ...prev, voiceTone: null }))
  }

  function validate() {
    const next = {}

    const nameErr  = validateName(fields.name)
    const bizErr   = validateRequired(fields.businessName, 'Business name')
                  || validateMaxLength(fields.businessName, 'Business name', 64)
    const nicheErr = validateRequired(fields.niche, 'Niche')
                  || validateMaxLength(fields.niche, 'Niche', 64)
    const descErr  = validateMaxLength(fields.businessDescription, 'Description', 500)
    const audErr   = validateRequired(fields.targetAudience, 'Target audience')
                  || validateMaxLength(fields.targetAudience, 'Target audience', 500)
    const diffErr  = validateMaxLength(fields.differentiators, 'Differentiators', 500)

    if (nameErr)  next.name                = nameErr
    if (bizErr)   next.businessName        = bizErr
    if (nicheErr) next.niche               = nicheErr
    if (descErr)  next.businessDescription = descErr
    if (audErr)   next.targetAudience      = audErr
    if (diffErr)  next.differentiators     = diffErr
    if (!fields.voiceTone) next.voiceTone  = 'Select a voice tone'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) {
      // Scroll to first error field
      const firstError = document.querySelector('[aria-invalid="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstError.focus()
      }
      return
    }

    setIsLoading(true)
    setServerError(null)

    try {
      const body = {
        name:                sanitizeField(fields.name,                64),
        businessName:        sanitizeField(fields.businessName,        64),
        niche:               sanitizeField(fields.niche,               64),
        businessDescription: sanitizeField(fields.businessDescription, 500),
        targetAudience:      sanitizeField(fields.targetAudience,      500),
        differentiators:     sanitizeField(fields.differentiators,     500),
        voiceTone:           fields.voiceTone,
      }

      const data = await profileApi.update(body)
      updateProfile(data.profile)
      setToast({ message: 'Profile updated successfully.', type: 'success' })
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

  // Initials for avatar
  const initials = (user?.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary
              transition-colors duration-150 mb-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-accent flex items-center
              justify-center shrink-0">
              <span className="text-lg font-semibold text-white">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">{user?.name}</h1>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {serverError && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50
            border border-red-200 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

          {/* Personal info */}
          <Section
            title="Personal information"
            description="Your name as it appears in the app."
          >
            <Input
              id="name"
              label="Name"
              value={fields.name}
              onChange={handleChange}
              error={errors.name}
              maxLength={64}
              autoComplete="name"
              required
            />
          </Section>

          {/* Business info */}
          <Section
            title="Business"
            description="Mio uses this context to generate relevant content for your brand."
          >
            <Input
              id="businessName"
              label="Business name"
              value={fields.businessName}
              onChange={handleChange}
              error={errors.businessName}
              maxLength={64}
              required
            />
            <Input
              id="niche"
              label="Niche"
              value={fields.niche}
              onChange={handleChange}
              error={errors.niche}
              maxLength={64}
              required
            />
            <Textarea
              id="businessDescription"
              label="About your business"
              value={fields.businessDescription}
              onChange={handleChange}
              error={errors.businessDescription}
              maxLength={500}
              rows={3}
            />
          </Section>

          {/* Audience */}
          <Section
            title="Audience"
            description="Who you're creating content for."
          >
            <Textarea
              id="targetAudience"
              label="Target audience"
              value={fields.targetAudience}
              onChange={handleChange}
              error={errors.targetAudience}
              maxLength={500}
              rows={3}
              required
            />
            <Textarea
              id="differentiators"
              label="What sets you apart?"
              value={fields.differentiators}
              onChange={handleChange}
              error={errors.differentiators}
              maxLength={500}
              rows={3}
              hint="Optional"
            />
          </Section>

          {/* Voice tone */}
          <Section
            title="Brand voice"
            description="Mio writes every post in this tone."
          >
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Voice tone">
              {VOICE_TONES.map(tone => (
                <button
                  key={tone.value}
                  type="button"
                  role="radio"
                  aria-checked={fields.voiceTone === tone.value}
                  onClick={() => handleToneSelect(tone.value)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                    transition-colors duration-150
                    ${fields.voiceTone === tone.value
                      ? 'border-accent bg-soft'
                      : 'border-border bg-white hover:bg-surface'
                    }
                  `}
                >
                  <span className="text-lg shrink-0" aria-hidden="true">{tone.emoji}</span>
                  <span className={`text-sm font-medium ${
                    fields.voiceTone === tone.value ? 'text-accent' : 'text-primary'
                  }`}>
                    {tone.label}
                  </span>
                  {fields.voiceTone === tone.value && (
                    <svg className="ml-auto h-4 w-4 text-accent shrink-0" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {errors.voiceTone && (
              <p className="text-xs text-red-500" role="alert">{errors.voiceTone}</p>
            )}
          </Section>

          {/* Submit */}
          <div className="flex justify-end pb-4">
            <Button type="submit" isLoading={isLoading} disabled={isLoading || !hasChanges}>
              Save changes
            </Button>
          </div>

        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </DashboardLayout>
  )
}