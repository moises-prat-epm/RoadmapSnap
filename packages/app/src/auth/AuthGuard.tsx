import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
