import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'

// Pages 
import LandingPage     from './pages/LandingPage.jsx'
import LoginPage       from './pages/auth/LoginPage.jsx'
import RegisterPage    from './pages/auth/RegisterPage.jsx'
import OnboardingPage  from './pages/onboarding/OnboardingPage.jsx'
import BrainstormPage  from './pages/dashboard/BrainstormPage.jsx'
import CreatePage      from './pages/dashboard/CreatePage.jsx'
import ChatPage        from './pages/chat/ChatPage.jsx'
import ProfilePage     from './pages/ProfilePage.jsx'
import SettingsPage    from './pages/SettingsPage.jsx'

// ─── Route Guards ────────────────────────────────────────────────────────────

// Public routes: accessible only when NOT authenticated
// If already logged in → go to dashboard
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard/brainstorm" replace />
  return children
}

// Private routes: accessible only when authenticated + onboarding complete
// If not logged in → go to login
// If logged in but onboarding not done → go to onboarding
function PrivateRoute({ children }) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!profile?.onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

// Onboarding route: only for authenticated users who haven't completed onboarding
// If not logged in → go to login
// If already completed onboarding → go to dashboard
function OnboardingRoute({ children }) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (profile?.onboardingComplete) return <Navigate to="/dashboard/brainstorm" replace />
  return children
}

// ─── Routes ──────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
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

      {/* Fallback: any unknown URL → landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes>
        </AppRoutes>
      </AuthProvider>
    </BrowserRouter>
  )
}