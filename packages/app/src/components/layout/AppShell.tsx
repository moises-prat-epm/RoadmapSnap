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
    <div className="min-h-screen bg-page">
      {/* Fixed sidebar — content column scrolls the window (Lite-style), not a nested pane */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col overflow-y-auto border-r border-slate-700 bg-slate-800">
        <div className="border-b border-slate-700 p-4">
          <span className="text-lg font-semibold text-white">RoadmapSnap</span>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          <a
            href="/dashboard"
            className="flex items-center rounded-md px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            Dashboard
          </a>
          <span className="flex cursor-not-allowed items-center rounded-md px-3 py-2 text-slate-500" title="Epic 2">
            Timeline
          </span>
          <span className="flex cursor-not-allowed items-center rounded-md px-3 py-2 text-slate-500" title="Epic 2">
            Projects
          </span>
        </nav>
        {workspaceSelector && <div className="border-t border-slate-700 p-3">{workspaceSelector}</div>}
      </aside>

      <div className="ml-60 flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-bg-white px-6">
          <div className="flex flex-1 justify-center">
            <span className="truncate font-medium text-text-dark">
              {workspaceName || 'Select a workspace'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-medium text-white"
                title={user?.email}
              >
                {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate text-sm text-text-light">
                {user?.name ?? user?.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
              className="text-sm text-text-light hover:text-text-dark"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-page p-6">{children}</main>
      </div>
    </div>
  )
}
