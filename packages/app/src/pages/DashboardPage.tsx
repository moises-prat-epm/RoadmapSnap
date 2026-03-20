import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWorkspaces } from '../hooks/useWorkspace'
import { useWorkspaceProjects } from '../hooks/useWorkspace'
import { useCurrentUser } from '../hooks/useRole'
import { calculateStats, getTodayStr } from '../lib/stats'
import type { Project } from '../api/client'
import type { GanttFilter } from '../components/timeline/GanttTimeline'
import AppShell from '../components/layout/AppShell'
import KpiCards from '../components/dashboard/KpiCards'
import ProgressBar from '../components/dashboard/ProgressBar'
import GanttTimeline from '../components/timeline/GanttTimeline'
import FilterBar from '../components/projects/FilterBar'
import type { FilterState } from '../components/projects/FilterBar'
import ProjectList from '../components/projects/ProjectList'
import { applyProjectFilters, countTimelineEligible } from '../lib/projectFilters'

type TabId = 'dashboard' | 'timeline' | 'projects'

const defaultFilter: GanttFilter = {
  search: '',
  statusFilter: 'ALL',
  riskOnly: false,
  descopedOnly: false,
}

export default function DashboardPage() {
  const { data: userData } = useCurrentUser()
  const { data: workspacesData, isLoading: workspacesLoading, error: workspacesError, refetch: refetchWorkspaces } = useWorkspaces()
  const workspaces = workspacesData?.workspaces ?? []
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [filter, setFilter] = useState<GanttFilter>(defaultFilter)

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
    name?: string
    milestones: Record<string, string>
    at_risk: boolean
    show_in_timeline: boolean
    descoped: boolean
  }> = projects.map((p: Project) => ({
    name: p.name,
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
    descoped: p.descoped,
  }))

  const workflow = workspace?.workflow_definition ?? []
  const todayStr = getTodayStr()
  const stats = workflow.length > 0 ? calculateStats(projectsForStats, workflow, todayStr) : null

  const handleFilterBarChange = useCallback((partial: Partial<FilterState>) => {
    setFilter((f) => {
      const next = { ...f, ...partial }
      if (
        'search' in partial &&
        'statusFilter' in partial &&
        'riskOnly' in partial &&
        partial.search === '' &&
        partial.statusFilter === 'ALL' &&
        partial.riskOnly === false
      ) {
        next.descopedOnly = false
      }
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => setFilter(defaultFilter), [])

  const filterBarFilter: FilterState = useMemo(
    () => ({ search: filter.search, statusFilter: filter.statusFilter, riskOnly: filter.riskOnly }),
    [filter.search, filter.statusFilter, filter.riskOnly]
  )

  const { totalCount, filteredCount } = useMemo(() => {
    const wf = workspace?.workflow_definition ?? []
    if (!workspace || wf.length === 0) {
      return { totalCount: projects.length, filteredCount: projects.length }
    }
    const listFiltered = applyProjectFilters(projects, wf, filter, todayStr, 'list')
    const timelineFiltered = applyProjectFilters(projects, wf, filter, todayStr, 'timeline')
    if (activeTab === 'projects') {
      return { totalCount: projects.length, filteredCount: listFiltered.length }
    }
    if (activeTab === 'timeline') {
      return {
        totalCount: countTimelineEligible(projects),
        filteredCount: timelineFiltered.length,
      }
    }
    return { totalCount: projects.length, filteredCount: projects.length }
  }, [activeTab, projects, workspace, filter, todayStr])

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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'projects', label: 'Projects' },
  ]

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

      {!error && !isLoading && (workspaces.length > 0 || projectsData) && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'timeline' || activeTab === 'projects') && workspace && (
            <FilterBar
              workflow={workflow}
              filter={filterBarFilter}
              onFilterChange={handleFilterBarChange}
              totalCount={totalCount}
              filteredCount={filteredCount}
            />
          )}

          {activeTab === 'dashboard' && (
            <>
              {stats ? (
                <>
                  <KpiCards
                    stats={stats}
                    workflow={workflow}
                    onFilterByStatus={(key) =>
                      setFilter((f) => ({
                        ...f,
                        statusFilter: f.statusFilter === key ? 'ALL' : key,
                        riskOnly: false,
                        descopedOnly: false,
                      }))
                    }
                    onToggleRisk={() =>
                      setFilter((f) => ({ ...f, riskOnly: !f.riskOnly, descopedOnly: false }))
                    }
                    onToggleDescoped={() =>
                      setFilter((f) => ({ ...f, descopedOnly: !f.descopedOnly, riskOnly: false }))
                    }
                    activeStatusFilter={filter.statusFilter}
                    riskOnly={filter.riskOnly}
                    descopedOnly={filter.descopedOnly}
                  />
                  <div className="mt-4">
                    <ProgressBar
                      completionPercentage={stats.completionPercentage}
                      total={stats.total}
                      label="Overall completion"
                    />
                  </div>
                </>
              ) : workspaces.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No workspaces yet. Create one to get started.</p>
              ) : effectiveWorkspaceId && projectsData && projects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No projects in this workspace yet.</p>
              ) : null}
            </>
          )}

          {activeTab === 'timeline' && workspace && (
            <GanttTimeline
              projects={projects}
              workspace={workspace}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}

          {activeTab === 'timeline' && !workspace && projectsData && (
            <p className="text-gray-500 dark:text-gray-400">Select a workspace to view the timeline.</p>
          )}

          {activeTab === 'projects' && workspace && (
            <ProjectList
              projects={projects}
              workspace={workspace}
              filter={filter}
              onClearFilters={clearAllFilters}
            />
          )}

          {activeTab === 'projects' && !workspace && projectsData && (
            <p className="text-gray-500 dark:text-gray-400">Select a workspace to view projects.</p>
          )}
        </div>
      )}

      {!error && !isLoading && !projectsData && workspaces.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No workspaces yet. Create one to get started.</p>
      )}
    </AppShell>
  )
}
