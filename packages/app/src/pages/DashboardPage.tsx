import { useAuth0 } from '@auth0/auth0-react'

export default function DashboardPage() {
  const { user, logout } = useAuth0()
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
      <p className="text-gray-400">Dashboard loading... (Epic 2 Step 5)</p>
    </div>
  )
}
