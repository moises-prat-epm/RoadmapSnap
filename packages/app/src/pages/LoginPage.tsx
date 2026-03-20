import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-page">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-text-dark">RoadmapSnap</h1>
        <p className="mt-2 text-text-light">AI-powered PMO platform</p>
      </div>
      <button
        onClick={() => loginWithRedirect()}
        className="rounded-lg bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        Sign in
      </button>
    </div>
  )
}
