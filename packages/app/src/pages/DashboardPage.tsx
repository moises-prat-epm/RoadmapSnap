import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useWorkspaces } from '../hooks/useWorkspace'
import { useWorkspaceProjects } from '../hooks/useWorkspace'
import { useCurrentUser } from '../hooks/useRole'
import type { Project } from '../api/client'
import type {
  GanttFilter,
  GanttTimelineHandle,
  ZoomPreset,
  TimelineSortState,
} from '../components/timeline/GanttTimeline'
import AppShell from '../components/layout/AppShell'
import KpiCards from '../components/dashboard/KpiCards'
import ProgressBar from '../components/dashboard/ProgressBar'
import GanttTimeline from '../components/timeline/GanttTimeline'
import FloatingTimelineFilterBar from '../components/timeline/FloatingTimelineFilterBar'
import FloatingExportMenu from '../components/timeline/FloatingExportMenu'
import ProjectList from '../components/projects/ProjectList'
import {
  applyProjectFilters,
  countTimelineEligible,
  countTimelineRiskSignaledProjects,
  countTimelineDescopedProjects,
  countListRiskSignaledProjects,
  countListDescopedProjects,
  getTimelineGroupNames,
} from '../lib/projectFilters'
import { applyThemeClassToDocument, writeStoredTheme } from '../lib/themeStorage'
import { calculateStats, getTodayStr } from '../lib/stats'
import { defaultTimelineSort } from '../lib/timelineSort'

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
  const [timelineZoom, setTimelineZoom] = useState<ZoomPreset>('all')
  const [timelineSort, setTimelineSort] = useState<TimelineSortState>(() => ({ ...defaultTimelineSort }))
  const ganttRef = useRef<GanttTimelineHandle>(null)

  const mergeFilter = useCallback((partial: Partial<GanttFilter>) => {
    setFilter((f) => ({ ...f, ...partial }))
  }, [])

  const mergeTimelineSort = useCallback((partial: Partial<TimelineSortState>) => {
    setTimelineSort((s) => ({ ...s, ...partial }))
  }, [])

  const effectiveWorkspaceId = selectedWorkspaceId ?? (workspaces[0]?.id ?? null)
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useWorkspaceProjects(effectiveWorkspaceId)

  const selectedWorkspace = workspaces.find((w) => w.id === effectiveWorkspaceId)
  const workspaceName = selectedWorkspace?.name ?? ''

  useEffect(() => {
    if (userData === undefined) return
    const theme = userData.preferences?.theme ?? 'light'
    const stored: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light'
    applyThemeClassToDocument(stored)
    writeStoredTheme(stored)
  }, [userData])

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id)
    }
  }, [workspaces, selectedWorkspaceId])

  const isLoading = workspacesLoading || (!!effectiveWorkspaceId && projectsLoading)
  const error = workspacesError ?? projectsError
  const workspace = projectsData?.workspace
  const projects = projectsData?.projects ?? []

  const workflow = workspace?.workflow_definition ?? []
  const todayStr = getTodayStr()

  const projectsForStats = useMemo(
    () =>
      projects.map((p: Project) => ({
        name: p.name,
        milestones: p.milestones ?? {},
        at_risk: p.at_risk,
        show_in_timeline: p.show_in_timeline,
        descoped: p.descoped,
      })),
    [projects]
  )

  const stats = useMemo(() => {
    if (workflow.length === 0) return null
    return calculateStats(projectsForStats, workflow, todayStr)
  }, [projectsForStats, workflow, todayStr])

  const timelineRiskSignaledCount = useMemo(
    () => countTimelineRiskSignaledProjects(projects, workflow),
    [projects, workflow]
  )
  const timelineDescopedCount = useMemo(() => countTimelineDescopedProjects(projects), [projects])
  const listRiskSignaledCount = useMemo(
    () => countListRiskSignaledProjects(projects, workflow),
    [projects, workflow]
  )
  const listDescopedCount = useMemo(() => countListDescopedProjects(projects), [projects])

  useEffect(() => {
    if (activeTab !== 'timeline' && activeTab !== 'projects') return
    setFilter((f) => {
      let changed = false
      const next = { ...f }
      const riskZero = activeTab === 'projects' ? listRiskSignaledCount === 0 : timelineRiskSignaledCount === 0
      const descopedZero = activeTab === 'projects' ? listDescopedCount === 0 : timelineDescopedCount === 0
      if (riskZero && f.riskOnly) {
        next.riskOnly = false
        changed = true
      }
      if (descopedZero && f.descopedOnly) {
        next.descopedOnly = false
        changed = true
      }
      return changed ? next : f
    })
  }, [
    activeTab,
    timelineRiskSignaledCount,
    timelineDescopedCount,
    listRiskSignaledCount,
    listDescopedCount,
  ])

  const clearAllFilters = useCallback(() => setFilter(defaultFilter), [])

  const workspaceSelector = (
    <select
      value={effectiveWorkspaceId ?? ''}
      onChange={(e) => setSelectedWorkspaceId(e.target.value || null)}
      className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-2 text-sm text-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500"
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

  const reserveFloatingFilterSpace =
    (activeTab === 'timeline' || activeTab === 'projects') && workflow.length > 0

  return (
    <AppShell workspaceName={workspaceName} workspaceSelector={workspaceSelector}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-medium">Failed to load workspace data. Please try again.</p>
          {error?.message && (
            <p className="mt-1 text-sm opacity-90">{error.message}</p>
          )}
          {(error as { status?: number })?.status === 401 && (
            <p className="mt-2 text-sm">
              Make sure the API is running and its <code className="rounded bg-red-100 px-1 dark:bg-red-900/40">AUTH0_DOMAIN</code> matches your Auth0 tenant (e.g. dev-ju4e2czu1j0u3o2a.us.auth0.com).
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-secondary"
            />
          ))}
        </div>
      )}

      {!error && !isLoading && (workspaces.length > 0 || projectsData) && (
        <div
          className={`flex flex-col gap-2 ${reserveFloatingFilterSpace ? 'dashboard-page--floating-filter' : ''}`}
        >
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t border-b-2 -mb-px px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-m3 text-m3'
                    : 'border-transparent text-text-light hover:text-text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'projects' && workspace && (
            <div className="flex flex-col pt-5 max-md:pt-7">
              {workflow.length > 0 && (
                <div className="timeline-filter-bar-sticky-wrap">
                  <FloatingTimelineFilterBar
                    variant="projects"
                    workflow={workflow}
                    filter={filter}
                    onFilterChange={mergeFilter}
                    timelineSort={timelineSort}
                    onTimelineSortChange={mergeTimelineSort}
                    totalCount={projects.length}
                    filteredCount={
                      workspace
                        ? applyProjectFilters(projects, workflow, filter, todayStr, 'list').length
                        : 0
                    }
                    zoom={timelineZoom}
                    onZoomChange={setTimelineZoom}
                    showGroupControls={false}
                    onExpandAll={() => {}}
                    onCollapseAll={() => {}}
                    showAtRiskFilter={listRiskSignaledCount > 0}
                    atRiskCount={listRiskSignaledCount}
                    showDescopedFilter={listDescopedCount > 0}
                  />
                </div>
              )}
              <ProjectList
                projects={projects}
                workspace={workspace}
                workspaceId={effectiveWorkspaceId!}
                filter={filter}
                onClearFilters={clearAllFilters}
              />
            </div>
          )}

          {activeTab === 'dashboard' && workspace && stats && (
            <div className="space-y-6 rounded-lg border border-border bg-bg-white p-6">
              <ProgressBar
                completionPercentage={stats.completionPercentage}
                total={stats.total}
                label=""
              />
              <p className="text-sm text-text-light">
                More KPIs will appear here soon.
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && workspace && !stats && (
            <p className="text-text-light">Configure workflow to see dashboard metrics.</p>
          )}

          {activeTab === 'dashboard' && !workspace && projectsData && (
            <p className="text-text-light">Select a workspace to view the dashboard.</p>
          )}

          {activeTab === 'timeline' && workspace && (
            <div className="flex flex-col pt-5 max-md:pt-9">
              {workflow.length > 0 && (
                <div className="timeline-filter-bar-sticky-wrap">
                  <FloatingTimelineFilterBar
                    variant="timeline"
                    workflow={workflow}
                    filter={filter}
                    onFilterChange={mergeFilter}
                    timelineSort={timelineSort}
                    onTimelineSortChange={mergeTimelineSort}
                    totalCount={countTimelineEligible(projects)}
                    filteredCount={
                      applyProjectFilters(projects, workflow, filter, todayStr, 'timeline').length
                    }
                    zoom={timelineZoom}
                    onZoomChange={setTimelineZoom}
                    showGroupControls={
                      getTimelineGroupNames(projects, workflow, filter, todayStr, workspace).length > 0
                    }
                    onExpandAll={() => ganttRef.current?.expandAllGroups()}
                    onCollapseAll={() => ganttRef.current?.collapseAllGroups()}
                    showAtRiskFilter={timelineRiskSignaledCount > 0}
                    atRiskCount={timelineRiskSignaledCount}
                    showDescopedFilter={timelineDescopedCount > 0}
                  />
                </div>
              )}
              {workflow.length > 0 && (
                <FloatingExportMenu
                  onExportPNG={() => ganttRef.current?.exportPNG()}
                  onExportCSV={() => ganttRef.current?.exportCSV()}
                  onExportJSON={() => ganttRef.current?.exportJSON()}
                />
              )}
              {stats && (
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
                  activeStatusFilter={filter.statusFilter}
                />
              )}
              <div className="mt-6">
                <GanttTimeline
                  ref={ganttRef}
                  projects={projects}
                  workspace={workspace}
                  filter={filter}
                  zoom={timelineZoom}
                  timelineSort={timelineSort}
                />
              </div>
            </div>
          )}

          {activeTab === 'timeline' && !workspace && projectsData && (
            <p className="text-text-light">Select a workspace to view the timeline.</p>
          )}

          {activeTab === 'projects' && !workspace && projectsData && (
            <p className="text-text-light">Select a workspace to view projects.</p>
          )}
        </div>
      )}

      {!error && !isLoading && !projectsData && workspaces.length === 0 && (
        <p className="text-text-light">No workspaces yet. Create one to get started.</p>
      )}
    </AppShell>
  )
}
