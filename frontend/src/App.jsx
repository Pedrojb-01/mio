import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

import LandingPage     from './pages/LandingPage.jsx'
import NotFoundPage    from './pages/NotFoundPage.jsx'
import LoginPage       from './pages/auth/LoginPage.jsx'
import RegisterPage    from './pages/auth/RegisterPage.jsx'
import OnboardingPage  from './pages/onboarding/OnboardingPage.jsx'
import BrainstormPage  from './pages/dashboard/BrainstormPage.jsx'
import CreatePage      from './pages/dashboard/CreatePage.jsx'
import ChatPage        from './pages/chat/ChatPage.jsx'
import ProfilePage     from './pages/ProfilePage.jsx'
import SettingsPage    from './pages/SettingsPage.jsx'
import AdminPage from './pages/admin/AdminPage.jsx'


function AppLoader() {
  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center gap-5">
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        aria-label="Loading"
        className="animate-spin"
      >
        <circle
          cx="28" cy="28" r="22"
          stroke="currentColor"
          strokeWidth="4"
          className="text-border"
        />
        <path
          d="M28 6 A22 22 0 0 1 50 28"
          stroke="#800020"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm text-muted">Loading...</p>
    </div>
  )
}


function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <AppLoader />
  if (isAuthenticated) return <Navigate to="/dashboard/brainstorm" replace />
  return children
}

function PrivateRoute({ children }) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  if (isLoading) return <AppLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!profile?.onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

function OnboardingRoute({ children }) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  if (isLoading) return <AppLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (profile?.onboardingComplete) return <Navigate to="/dashboard/brainstorm" replace />
  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, profile, user, isLoading } = useAuth()
  if (isLoading) return <AppLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!profile?.onboardingComplete) return <Navigate to="/onboarding" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard/brainstorm" replace />
  return children
}


function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      {/* Onboarding */}
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

      {/* Private */}
      <Route path="/dashboard/brainstorm" element={<PrivateRoute><BrainstormPage /></PrivateRoute>} />
      <Route path="/dashboard/create"     element={<PrivateRoute><CreatePage /></PrivateRoute>} />
      <Route path="/chat/:id"             element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/profile"              element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings"             element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      {/* Fallback: any unknown URL → 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}


export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}