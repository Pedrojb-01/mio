import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

function Section({ title, description, children }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3
      border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full
        transition-colors duration-200 cursor-pointer focus-visible:ring-2
        focus-visible:ring-accent focus-visible:ring-offset-2
        ${enabled ? 'bg-accent' : 'bg-border'}
      `}
    >
      <span className={`
        inline-block h-3.5 w-3.5 rounded-full bg-surface shadow
        transition-transform duration-200
        ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}
      `} />
    </button>
  )
}

export default function SettingsPage() {
  const navigate      = useNavigate()
  const { user }      = useAuth()

  // UI-only for now — dark mode wiring comes later
  const { isDark, setIsDark } = useTheme()
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary
              transition-colors duration-150 mb-4 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-semibold text-primary">Settings</h1>
          <p className="text-sm text-muted mt-0.5">Manage your account preferences.</p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Account */}
          <Section
            title="Account"
            description="Your account details."
          >
            <SettingRow label="Email" description="Your login email address.">
              <span className="text-sm text-muted">{user?.email}</span>
            </SettingRow>

            <SettingRow
              label="Password"
              description="Password recovery is coming soon."
            >
              <span className="text-xs text-muted bg-surface border border-border
                px-2.5 py-1 rounded-lg">
                Coming soon
              </span>
            </SettingRow>
          </Section>

          {/* Appearance */}
          <Section
            title="Appearance"
            description="Customize how Mio looks."
          >
            <SettingRow
              label="Dark mode"
              description="Switch to a darker color scheme."
            >
              <Toggle
                enabled={isDark}
                onChange={setIsDark}
                label="Toggle dark mode"
              />
            </SettingRow>
          </Section>

          {/* Notifications */}
          <Section
            title="Notifications"
            description="Control what Mio sends you."
          >
            <SettingRow
              label="Email notifications"
              description="Receive updates and tips by email."
            >
              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
                label="Toggle email notifications"
              />
            </SettingRow>
          </Section>

          {/* About */}
          <Section title="About">
            <SettingRow label="Version" description="Current app version.">
              <span className="text-sm text-muted">1.0.0</span>
            </SettingRow>
            <SettingRow label="Built with" description="Stack and tools used.">
              <span className="text-sm text-muted">React · Node.js · Groq</span>
            </SettingRow>
          </Section>

        </div>
      </div>
    </DashboardLayout>
  )
}