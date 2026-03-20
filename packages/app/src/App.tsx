import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import CallbackPage from './pages/CallbackPage'
import DashboardPage from './pages/DashboardPage'
import AuthGuard from './auth/AuthGuard'

const LOADING_TIMEOUT_MS = 12_000

export default function App() {
  const { isLoading } = useAuth0()
  const [loadingTimedOut, setLoadingTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) return
    const t = setTimeout(() => setLoadingTimedOut(true), LOADING_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [isLoading])

  useEffect(() => {
    if (!isLoading) setLoadingTimedOut(false)
  }, [isLoading])

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="flex h-screen items-center justify-center bg-page">
        <div className="text-text-light">Loading...</div>
      </div>
    )
  }

  if (loadingTimedOut) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-page px-4">
        <p className="mb-6 max-w-sm text-center text-text-dark">
          Taking longer than usual. You can try signing in again or continue to the app.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700 text-center"
          >
            Sign in
          </a>
          <a
            href="/dashboard"
            className="rounded-lg border border-border bg-bg-white px-6 py-2.5 text-center font-medium text-text-dark hover:bg-secondary"
          >
            Continue to app
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm text-text-light hover:text-text-dark"
          >
            Refresh page
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/dashboard" element={
          <AuthGuard><DashboardPage /></AuthGuard>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
