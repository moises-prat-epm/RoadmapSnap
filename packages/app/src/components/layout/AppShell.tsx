import { useAuth0 } from '@auth0/auth0-react'
import ThemeToggle from './ThemeToggle'

interface AppShellProps {
  workspaceName: string
  children: React.ReactNode
  workspaceSelector?: React.ReactNode
}

export default function AppShell({ workspaceName, children, workspaceSelector }: AppShellProps) {
  const { user, logout } = useAuth0()
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-slate-800 dark:bg-slate-900 flex flex-col border-r border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <span className="text-white font-semibold text-lg">RoadmapSnap</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <a
            href="/dashboard"
            className="flex items-center px-3 py-2 rounded-md text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            Dashboard
          </a>
          <span className="flex items-center px-3 py-2 rounded-md text-slate-500 cursor-not-allowed" title="Epic 2">
            Timeline
          </span>
          <span className="flex items-center px-3 py-2 rounded-md text-slate-500 cursor-not-allowed" title="Epic 2">
            Projects
          </span>
        </nav>
        {workspaceSelector && (
          <div className="p-3 border-t border-slate-700">
            {workspaceSelector}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex-1 flex justify-center">
            <span className="text-gray-700 dark:text-gray-200 font-medium truncate">
              {workspaceName || 'Select a workspace'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-500 flex items-center justify-center text-white text-sm font-medium"
                title={user?.email}
              >
                {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                {user?.name ?? user?.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
