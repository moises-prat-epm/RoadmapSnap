import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

/**
 * Auth0 redirects here with tokens in the URL hash. We stay on this route
 * until the SDK has processed the hash, then redirect to /dashboard.
 */
export default function CallbackPage() {
  const { isAuthenticated, isLoading, error } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (error) {
      navigate('/login', { replace: true })
      return
    }
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
      return
    }
    navigate('/login', { replace: true })
  }, [isAuthenticated, isLoading, error, navigate])

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-page">
        <p className="mb-4 text-risk">Sign in failed: {error.message}</p>
        <a href="/login" className="text-m3 hover:underline">
          Back to sign in
        </a>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-page">
      <div className="text-text-light">Completing sign in...</div>
    </div>
  )
}
