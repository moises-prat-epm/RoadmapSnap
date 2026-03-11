import { useState, useMemo } from 'react'
import type { Project, Workspace, WorkflowItem } from '../../api/client'
import {
  generateMonths,
  calculatePosition,
  getTodayStr,
  buildMilestoneMarkers,
  buildGanttSegments,
  type MonthInfo,
  type ProjectLike,
  type WorkflowMilestone,
} from '../../lib/timeline'
import { getCurrentStatus } from '../../lib/stats'
import GanttBar from './GanttBar'
import MilestoneMarkerComponent from './MilestoneMarker'

export type ZoomPreset = '3m' | '6m' | '12m' | 'all'

export interface GanttFilter {
  search: string
  statusFilter: string
  riskOnly: boolean
}

interface GanttTimelineProps {
  projects: Project[]
  workspace: Workspace | null
  filter?: GanttFilter
  zoom?: ZoomPreset
}

function getWorkflowMilestones(workflow: WorkflowItem[]): WorkflowMilestone[] {
  return workflow.filter((item): item is WorkflowMilestone => item.type === 'milestone')
}

function projectToProjectLike(p: Project): ProjectLike {
  return {
    name: p.name,
    group: p.group_name,
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
    tags: p.tags ?? [],
  }
}

export default function GanttTimeline({
  projects,
  workspace,
  filter = { search: '', statusFilter: 'ALL', riskOnly: false },
  zoom: zoomProp = 'all',
}: GanttTimelineProps) {
  const [zoom, setZoom] = useState<ZoomPreset>(zoomProp)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const workflow = workspace?.workflow_definition ?? []
  const workflowMilestones = useMemo(() => getWorkflowMilestones(workflow), [workflow])
  const settings = (workspace?.settings ?? {}) as { start_month?: string; end_month?: string }
  const startMonth = settings.start_month ?? '01/2026'
  const endMonth = settings.end_month ?? '12/2026'

  const allMonths = useMemo(
    () => generateMonths(startMonth, endMonth),
    [startMonth, endMonth]
  )

  const todayStr = getTodayStr()

  const visibleMonths = useMemo((): MonthInfo[] => {
    if (zoom === 'all' || allMonths.length === 0) return allMonths
    const today = new Date()
    const todayYear = today.getFullYear()
    const todayMonth = today.getMonth()
    let startIndex = 0
    for (let i = 0; i < allMonths.length; i++) {
      const m = allMonths[i].date
      if (m.getFullYear() === todayYear && m.getMonth() === todayMonth) {
        startIndex = i
        break
      }
      if (m.getFullYear() > todayYear || (m.getFullYear() === todayYear && m.getMonth() > todayMonth)) {
        startIndex = i
        break
      }
    }
    const count = zoom === '3m' ? 3 : zoom === '6m' ? 6 : 12
    return allMonths.slice(startIndex, startIndex + count)
  }, [allMonths, zoom])

  const todayPosition = useMemo(
    () => (visibleMonths.length > 0 ? calculatePosition(todayStr, visibleMonths) : null),
    [todayStr, visibleMonths]
  )

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => p.show_in_timeline !== false)
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    }
    if (filter.statusFilter !== 'ALL') {
      list = list.filter(
        (p) => getCurrentStatus(projectToProjectLike(p), workflow, todayStr) === filter.statusFilter
      )
    }
    if (filter.riskOnly) {
      list = list.filter((p) => p.at_risk === true)
    }
    return list
  }, [projects, filter, workflow, todayStr])

  const totalDays = useMemo(
    () => visibleMonths.reduce((sum, m) => sum + m.daysInMonth, 0),
    [visibleMonths]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, Project[]> = {}
    filteredProjects.forEach((p) => {
      const g = p.group_name ?? '(No group)'
      if (!groups[g]) groups[g] = []
      groups[g].push(p)
    })
    return groups
  }, [filteredProjects])

  const groupNames = useMemo(() => Object.keys(grouped).sort(), [grouped])

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  if (workflow.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-slate-500 dark:text-slate-400">
        No workflow defined for this workspace. Add a workflow to see the timeline.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-200 dark:border-slate-700">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Zoom:</span>
        {(['3m', '6m', '12m', 'all'] as const).map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => setZoom(z)}
            className={`px-3 py-1 text-sm rounded ${
              zoom === z
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {z === 'all' ? 'All' : z.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Header row — month columns */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <div className="w-[200px] shrink-0 py-2 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
          Project
        </div>
        <div className="flex-1 relative min-w-0">
          <div className="flex h-full">
            {visibleMonths.map((m) => (
              <div
                key={m.name}
                className="shrink-0 py-2 px-1 text-center text-xs font-medium text-slate-600 dark:text-slate-400"
                style={{
                  width: `${totalDays > 0 ? (m.daysInMonth / totalDays) * 100 : 100 / visibleMonths.length}%`,
                }}
              >
                {m.name}
              </div>
            ))}
          </div>
          {/* Today line */}
          {todayPosition != null && (
            <div
              className="absolute top-0 bottom-0 w-0 border-l-2 border-dashed border-red-500 z-20 pointer-events-none"
              style={{ left: `${todayPosition}%` }}
            />
          )}
        </div>
      </div>

      {/* Project rows by group */}
      {groupNames.map((groupName) => {
        const groupProjects = grouped[groupName]
        const collapsed = collapsedGroups[groupName] ?? false
        return (
          <div key={groupName}>
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(groupName)}
              className="w-full flex items-center gap-2 py-2 px-3 text-left bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700"
            >
              <svg
                className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${collapsed ? '' : 'rotate-90'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {groupName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {groupProjects.length} item{groupProjects.length !== 1 ? 's' : ''}
              </span>
            </button>

            {!collapsed &&
              groupProjects.map((project, rowIndex) => {
                const like = projectToProjectLike(project)
                const segments = buildGanttSegments(
                  like,
                  visibleMonths,
                  todayPosition,
                  workflowMilestones
                )
                const markers = buildMilestoneMarkers(like, visibleMonths, workflowMilestones)
                const status = getCurrentStatus(like, workflow, todayStr)
                const stateItem = workflow.find((w) => w.type === 'state' && w.key === status)
                const bgRow =
                  rowIndex % 2 === 0
                    ? 'bg-white dark:bg-slate-800'
                    : 'bg-gray-50 dark:bg-slate-800/50'

                return (
                  <div
                    key={project.id}
                    className={`flex items-stretch border-b border-slate-100 dark:border-slate-700/50 ${bgRow}`}
                  >
                    {/* Label column */}
                    <div className="w-[200px] shrink-0 py-2 px-3 border-r border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        {project.at_risk && (
                          <span
                            className="shrink-0 w-2 h-2 rounded-full bg-amber-500"
                            title="At risk"
                          />
                        )}
                        <span
                          className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate"
                          title={project.name}
                        >
                          {project.name}
                        </span>
                      </div>
                      {project.group_name && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                          {project.group_name}
                        </span>
                      )}
                      <span
                        className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        title={stateItem?.title ?? status}
                      >
                        {stateItem?.short ?? status}
                      </span>
                    </div>

                    {/* Timeline track */}
                    <div className="flex-1 relative min-h-[44px] min-w-0 py-1">
                      <GanttBar segments={segments} />
                      {todayPosition != null && (
                        <div
                          className="absolute top-0 bottom-0 w-0 border-l-2 border-dashed border-red-500 z-10 pointer-events-none"
                          style={{ left: `${todayPosition}%` }}
                        />
                      )}
                      {markers.map((marker, i) => (
                        <MilestoneMarkerComponent key={i} marker={marker} />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )
      })}

      {groupNames.length === 0 && (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          No projects match the current filters.
        </div>
      )}
    </div>
  )
}
