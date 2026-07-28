import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <Link
        to={isAuthenticated ? '/dashboard/brainstorm' : '/'}
        className="flex items-center gap-2.5 mb-16 hover:opacity-80 transition-opacity duration-150"
      >
        <img src="/favicon.svg" alt="Mio" className="h-8 w-8 rounded-xl" />
        <span className="text-lg font-semibold tracking-tight text-primary">mio</span>
      </Link>

      {/* 404 */}
      <p className="text-8xl font-semibold text-primary mb-4 tracking-tight">404</p>
      <p className="text-base font-medium text-primary mb-2">Page not found</p>
      <p className="text-sm text-muted mb-10 text-center max-w-xs">
        Looks like this page doesn't exist or was moved.
      </p>

      {/* CTA */}
      <Link
        to={isAuthenticated ? '/dashboard/brainstorm' : '/'}
        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white
          bg-accent hover:brightness-110 transition-all duration-150"
      >
        Go home
      </Link>

    </div>
  )
}