import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../api/client.js'
import { sanitizeField, validateRequired, validateMaxLength } from '../../utils/sanitize.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Textarea from '../../components/ui/Textarea.jsx'

const TOTAL_STEPS = 3

const VOICE_TONES = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Clear, authoritative and trustworthy',
    emoji: '💼',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Friendly, relaxed and approachable',
    emoji: '👋',
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Motivating, uplifting and energetic',
    emoji: '🚀',
  },
  {
    value: 'educational',
    label: 'Educational',
    description: 'Informative, clear and helpful',
    emoji: '📚',
  },
  {
    value: 'humorous',
    label: 'Humorous',
    description: 'Fun, witty and entertaining',
    emoji: '😄',
  },
]

const INITIAL_FIELDS = {
  businessName:        '',
  niche:               '',
  businessDescription: '',
  targetAudience:      '',
  differentiators:     '',
  voiceTone:           '',
}

export default function OnboardingPage() {
  const { updateProfile } = useAuth()
  const navigate           = useNavigate()

  const [step, setStep]         = useState(1)
  const [fields, setFields]     = useState(INITIAL_FIELDS)
  const [errors, setErrors]     = useState({})
  const [serverError, setServerError] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)

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

  // ─── Validate current step before advancing ────────────────────────────────

  function validateStep(current) {
    const next = {}

    if (current === 1) {
      const nameErr  = validateRequired(fields.businessName, 'Business name')
                    || validateMaxLength(fields.businessName, 'Business name', 64)
      const nicheErr = validateRequired(fields.niche, 'Niche')
                    || validateMaxLength(fields.niche, 'Niche', 64)
      const descErr  = validateMaxLength(fields.businessDescription, 'Description', 500)

      if (nameErr)  next.businessName        = nameErr
      if (nicheErr) next.niche               = nicheErr
      if (descErr)  next.businessDescription = descErr
    }

    if (current === 2) {
      const audienceErr = validateRequired(fields.targetAudience, 'Target audience')
                       || validateMaxLength(fields.targetAudience, 'Target audience', 500)
      const diffErr     = validateMaxLength(fields.differentiators, 'Differentiators', 500)

      if (audienceErr) next.targetAudience  = audienceErr
      if (diffErr)     next.differentiators = diffErr
    }

    if (current === 3) {
      if (!fields.voiceTone) next.voiceTone = 'Select a voice tone'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleNext() {
    if (validateStep(step)) setStep(prev => prev + 1)
  }

  function handleBack() {
    setErrors({})
    setStep(prev => prev - 1)
  }

  // ─── Submit all fields at once ─────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(3)) return

    setIsLoading(true)
    setServerError(null)

    try {
      const body = {
        businessName:        sanitizeField(fields.businessName,        64),
        niche:               sanitizeField(fields.niche,               64),
        businessDescription: sanitizeField(fields.businessDescription, 500),
        targetAudience:      sanitizeField(fields.targetAudience,      500),
        differentiators:     sanitizeField(fields.differentiators,     500),
        voiceTone:           fields.voiceTone,
        platform:            'instagram',
      }

      const data = await api.post('/onboarding', body)
      updateProfile(data.profile)
      navigate('/dashboard/brainstorm', { replace: true })
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold tracking-tight text-primary">mio</span>
          <p className="mt-1 text-sm text-muted">Let's set up your workspace</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-xs text-muted">
              {step === 1 && 'Your business'}
              {step === 2 && 'Your audience'}
              {step === 3 && 'Brand voice'}
            </span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">

          {serverError && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600"
            >
              {serverError}
            </div>
          )}

          {/* Step 1 — Business */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="mb-1">
                <h2 className="text-base font-semibold text-primary">Tell us about your business</h2>
                <p className="text-sm text-muted mt-0.5">
                  Mio uses this to understand your brand and generate relevant content.
                </p>
              </div>

              <Input
                id="businessName"
                label="Business name"
                value={fields.businessName}
                onChange={handleChange}
                error={errors.businessName}
                placeholder="e.g. Studio Bloom"
                maxLength={64}
                required
              />

              <Input
                id="niche"
                label="Niche"
                value={fields.niche}
                onChange={handleChange}
                error={errors.niche}
                placeholder="e.g. Handmade jewelry, fitness coaching..."
                maxLength={64}
                required
              />

              <Textarea
                id="businessDescription"
                label="About your business"
                value={fields.businessDescription}
                onChange={handleChange}
                error={errors.businessDescription}
                placeholder="Briefly describe what you do and what makes your business special..."
                maxLength={500}
                rows={3}
              />
            </div>
          )}

          {/* Step 2 — Audience */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="mb-1">
                <h2 className="text-base font-semibold text-primary">Who do you serve?</h2>
                <p className="text-sm text-muted mt-0.5">
                  The more specific, the better Mio can tailor your content.
                </p>
              </div>

              <Textarea
                id="targetAudience"
                label="Target audience"
                value={fields.targetAudience}
                onChange={handleChange}
                error={errors.targetAudience}
                placeholder="e.g. Women 25-40 who love minimalist fashion and follow sustainable brands..."
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
                placeholder="e.g. All pieces are handmade, we use recycled materials, free shipping..."
                maxLength={500}
                rows={3}
                hint="Optional — but helps Mio highlight what makes you unique"
              />
            </div>
          )}

          {/* Step 3 — Brand Voice */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="mb-1">
                <h2 className="text-base font-semibold text-primary">What's your brand voice?</h2>
                <p className="text-sm text-muted mt-0.5">
                  Mio will write every post in this tone.
                </p>
              </div>

              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Voice tone">
                {VOICE_TONES.map(tone => (
                  <button
                    key={tone.value}
                    type="button"
                    role="radio"
                    aria-checked={fields.voiceTone === tone.value}
                    onClick={() => handleToneSelect(tone.value)}
                    className={`
                      flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left
                      transition-colors duration-150 cursor-pointer
                      ${fields.voiceTone === tone.value
                        ? 'border-accent bg-soft'
                        : 'border-border bg-surface hover:bg-surface'
                      }
                    `}
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">{tone.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${fields.voiceTone === tone.value ? 'text-accent' : 'text-primary'}`}>
                        {tone.label}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{tone.description}</p>
                    </div>
                    {fields.voiceTone === tone.value && (
                      <svg className="ml-auto h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {errors.voiceTone && (
                <p className="text-xs text-red-500" role="alert">{errors.voiceTone}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className={`mt-6 flex gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
            )}

            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
                Finish setup
              </Button>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}