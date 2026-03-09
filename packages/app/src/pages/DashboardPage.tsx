import { useState, useEffect } from 'react'
import { useWorkspaces } from '../hooks/useWorkspace'
import { useWorkspaceProjects } from '../hooks/useWorkspace'
import { useCurrentUser } from '../hooks/useRole'
import { calculateStats, getTodayStr } from '../lib/stats'
import type { Project } from '../api/client'
import AppShell from '../components/layout/AppShell'
import KpiCards from '../components/dashboard/KpiCards'

export default function DashboardPage() {
  const { data: userData } = useCurrentUser()
  const { data: workspacesData, isLoading: workspacesLoading, error: workspacesError, refetch: refetchWorkspaces } = useWorkspaces()
  const workspaces = workspacesData?.workspaces ?? []
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)

  const effectiveWorkspaceId = selectedWorkspaceId ?? (workspaces[0]?.id ?? null)
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useWorkspaceProjects(effectiveWorkspaceId)

  const selectedWorkspace = workspaces.find((w) => w.id === effectiveWorkspaceId)
  const workspaceName = selectedWorkspace?.name ?? ''

  // Sync theme to document for Tailwind dark mode
  useEffect(() => {
    const theme = userData?.preferences?.theme ?? 'light'
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [userData?.preferences?.theme])

  // Default selected workspace to first when list loads
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id)
    }
  }, [workspaces, selectedWorkspaceId])

  const isLoading = workspacesLoading || (!!effectiveWorkspaceId && projectsLoading)
  const error = workspacesError ?? projectsError
  const workspace = projectsData?.workspace
  const projects = projectsData?.projects ?? []

  const projectsForStats: Array<{
    milestones: Record<string, string>
    at_risk: boolean
    show_in_timeline: boolean
    descoped: boolean
  }> = projects.map((p: Project) => ({
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
    descoped: p.descoped,
  }))

  const workflow = workspace?.workflow_definition ?? []
  const stats = workflow.length > 0 ? calculateStats(projectsForStats, workflow, getTodayStr()) : null

  const workspaceSelector = (
    <select
      value={effectiveWorkspaceId ?? ''}
      onChange={(e) => setSelectedWorkspaceId(e.target.value || null)}
      className="w-full rounded border border-slate-600 bg-slate-800 text-slate-200 px-2 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
    >
      <option value="">Select workspace</option>
      {workspaces.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  )

  return (
    <AppShell workspaceName={workspaceName} workspaceSelector={workspaceSelector}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          <p className="font-medium">Failed to load workspace data. Please try again.</p>
          {error?.message && (
            <p className="mt-1 text-sm opacity-90">{error.message}</p>
          )}
          {(error as { status?: number })?.status === 401 && (
            <p className="mt-2 text-sm">
              Make sure the API is running and its <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">AUTH0_DOMAIN</code> matches your Auth0 tenant (e.g. dev-ju4e2czu1j0u3o2a.us.auth0.com).
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              refetchWorkspaces()
              refetchProjects()
            }}
            className="mt-3 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {!error && isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      )}

      {!error && !isLoading && stats && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <KpiCards stats={stats} workflow={workflow} />
        </div>
      )}

      {!error && !isLoading && !stats && workspaces.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No workspaces yet. Create one to get started.</p>
      )}

      {!error && !isLoading && !stats && workspaces.length > 0 && effectiveWorkspaceId && projectsData && projects.length === 0 && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">No projects in this workspace yet.</p>
        </div>
      )}
    </AppShell>
  )
}
