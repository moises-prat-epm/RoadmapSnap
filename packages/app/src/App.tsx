import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import CallbackPage from './pages/CallbackPage'
import DashboardPage from './pages/DashboardPage'
import AuthGuard from './auth/AuthGuard'

export default function App() {
  const { isLoading } = useAuth0()
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  )
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
