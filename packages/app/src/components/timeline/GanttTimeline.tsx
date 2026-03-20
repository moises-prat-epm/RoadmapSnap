import { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import type { Project, Workspace } from '../../api/client'
import {
  generateMonths,
  generateVisibleMonthsForZoom,
  calculatePosition,
  getTodayStr,
  buildMilestoneMarkers,
  buildGanttSegments,
  formatDateDisplay,
  type MonthInfo,
  type ProjectLike,
} from '../../lib/timeline'
import { getCurrentStatus } from '../../lib/stats'
import {
  applyProjectFilters,
  getBlockedByRedDependencySet,
  getWorkflowMilestones,
  type WorkspaceProjectFilter,
} from '../../lib/projectFilters'
import { exportToPNG, exportToCSV, exportToJSON } from '../../lib/export'
import { getDependencyGraph } from '../../lib/dependencyGraph'
import GanttBar from './GanttBar'
import MilestoneMarkerComponent from './MilestoneMarker'
import KeyMilestones from './KeyMilestones'
import DependencyArrows from './DependencyArrows'
import { type ZoomPreset } from './TimelineToolbar'
import { sortTimelineProjects, type TimelineSortState, defaultTimelineSort } from '../../lib/timelineSort'

export type { ZoomPreset }
export type { TimelineSortState }

export type GanttFilter = WorkspaceProjectFilter

interface GanttTimelineProps {
  projects: Project[]
  workspace: Workspace | null
  filter?: GanttFilter
  /** Zoom preset (controlled from Dashboard filter bar). */
  zoom: ZoomPreset
  /** Row order within groups (Lite-style). */
  timelineSort?: TimelineSortState
}

/** Imperative actions for parent (exports + group controls from filter bar). */
export type GanttTimelineHandle = {
  exportPNG: () => void
  exportCSV: () => void
  exportJSON: () => void
  expandAllGroups: () => void
  collapseAllGroups: () => void
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

/** 'inbound' | 'outbound' | 'both' | null when no deps */
function getDependencyType(project: Project, allProjects: Project[]): 'inbound' | 'outbound' | 'both' | null {
  const inbound = project.dependencies?.length ?? 0
  const outbound = allProjects.filter(
    (p) => p.id !== project.id && p.dependencies?.some((d) => (typeof d === 'string' ? d : d.task) === project.name)
  ).length
  if (inbound > 0 && outbound > 0) return 'both'
  if (inbound > 0) return 'inbound'
  if (outbound > 0) return 'outbound'
  return null
}

const GanttTimeline = forwardRef<GanttTimelineHandle, GanttTimelineProps>(function GanttTimeline(
  {
    projects,
    workspace,
    filter = { search: '', statusFilter: 'ALL', riskOnly: false, descopedOnly: false },
    zoom,
    timelineSort = defaultTimelineSort,
  },
  ref
) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [activeDependencyGraph, setActiveDependencyGraph] = useState<string | null>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const arrowsContainerRef = useRef<HTMLDivElement>(null)
  const safeFilter = filter ?? { search: '', statusFilter: 'ALL', riskOnly: false, descopedOnly: false }

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
    const count = zoom === '3m' ? 3 : zoom === '6m' ? 6 : 12
    return generateVisibleMonthsForZoom(today, count)
  }, [allMonths, zoom])

  const todayPosition = useMemo(
    () => (visibleMonths.length > 0 ? calculatePosition(todayStr, visibleMonths) : null),
    [todayStr, visibleMonths]
  )

  const filteredProjects = useMemo(
    () => applyProjectFilters(projects, workflow, safeFilter, todayStr, 'timeline'),
    [projects, workflow, safeFilter, todayStr]
  )

  const sortedFilteredProjects = useMemo(
    () =>
      sortTimelineProjects(filteredProjects, projects, workflow, todayStr, timelineSort),
    [filteredProjects, projects, workflow, todayStr, timelineSort]
  )

  const visibleProjectNames = useMemo(
    () => new Set(sortedFilteredProjects.map((p) => p.name)),
    [sortedFilteredProjects]
  )

  const redBlockedSet = useMemo(
    () => getBlockedByRedDependencySet(projects, workflowMilestones),
    [projects, workflowMilestones]
  )

  const totalDays = useMemo(
    () => visibleMonths.reduce((sum, m) => sum + m.daysInMonth, 0),
    [visibleMonths]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, Project[]> = {}
    sortedFilteredProjects.forEach((p) => {
      const g = p.group_name ?? '(No group)'
      if (!groups[g]) groups[g] = []
      groups[g].push(p)
    })
    return groups
  }, [sortedFilteredProjects])

  const groupOrder = (workspace?.settings as { group_order?: string[] } | undefined)?.group_order
  const groupNames = useMemo(() => {
    const names = Object.keys(grouped)
    if (Array.isArray(groupOrder) && groupOrder.length > 0) {
      return names.sort((a, b) => {
        const i = groupOrder.indexOf(a)
        const j = groupOrder.indexOf(b)
        if (i === -1 && j === -1) return a.localeCompare(b)
        if (i === -1) return 1
        if (j === -1) return -1
        return i - j
      })
    }
    return names.sort()
  }, [grouped, groupOrder])

  const dependencyGraph = useMemo(
    () => (activeDependencyGraph ? getDependencyGraph(activeDependencyGraph, projects) : null),
    [activeDependencyGraph, projects]
  )
  const dependencyGraphNodes = useMemo(
    () => new Set(dependencyGraph?.nodes ?? []),
    [dependencyGraph]
  )

  useEffect(() => {
    setActiveDependencyGraph(null)
  }, [safeFilter.search, safeFilter.statusFilter, safeFilter.riskOnly, safeFilter.descopedOnly, zoom, timelineSort.by, timelineSort.order])

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const stateKeys = useMemo(
    () => workflow.filter((w) => w.type === 'state').map((w) => w.key),
    [workflow]
  )

  const expandAll = () => setCollapsedGroups({})
  const collapseAll = () => {
    const next: Record<string, boolean> = {}
    groupNames.forEach((g) => (next[g] = true))
    setCollapsedGroups(next)
  }

  const handleExportPNG = useCallback(() => {
    exportToPNG(timelineContainerRef.current, 'Timeline').catch(console.error)
  }, [])
  const handleExportCSV = useCallback(
    () => exportToCSV(sortedFilteredProjects, workflow, todayStr),
    [sortedFilteredProjects, workflow, todayStr]
  )
  const handleExportJSON = useCallback(
    () => exportToJSON(sortedFilteredProjects, workspace, workflow, todayStr),
    [sortedFilteredProjects, workspace, workflow, todayStr]
  )

  useImperativeHandle(
    ref,
    () => ({
      exportPNG: handleExportPNG,
      exportCSV: handleExportCSV,
      exportJSON: handleExportJSON,
      expandAllGroups: expandAll,
      collapseAllGroups: collapseAll,
    }),
    [handleExportPNG, handleExportCSV, handleExportJSON, expandAll, collapseAll]
  )

  if (workflow.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-white p-6 text-text-light">
        No workflow defined for this workspace. Add a workflow to see the timeline.
      </div>
    )
  }

  return (
    <div className="timeline-view">
      {/* Key milestones — filter bar is above KPI in Dashboard (Lite order) */}
      <KeyMilestones projects={projects} workflow={workflow} todayStr={todayStr} />

      {/* State legend */}
      <div className="state-legend">
        <div className="state-legend-items">
          {stateKeys.map((key, i) => {
            const stateItem = workflow.find((w) => w.type === 'state' && w.key === key)
            const stateClass = `state-${Math.min(i, 7)}`
            return (
              <div key={key} className="state-legend-item">
                <span className={`state-legend-badge ${stateClass}`}>{stateItem?.short ?? key}</span>
                <span className="state-legend-label">{stateItem?.title ?? key}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div ref={timelineContainerRef} className="timeline-export-wrapper">
      <div ref={arrowsContainerRef} style={{ position: 'relative' }}>
      <div className="timeline-header">
        <div className="timeline-label">Project</div>
        <div className="timeline-months relative flex-1 flex">
          {visibleMonths.map((m) => {
            const pct = totalDays > 0 ? (m.daysInMonth / totalDays) * 100 : 100 / visibleMonths.length
            return (
              <div
                key={m.name}
                className="month-column text-center"
                style={{
                  flex: `0 0 ${pct}%`,
                  width: `${pct}%`,
                }}
              >
                {m.name}
              </div>
            )
          })}
          {todayPosition != null && (
            <div
              className="today-guide-line"
              style={{ left: `${todayPosition}%` }}
            />
          )}
        </div>
      </div>

      {groupNames.map((groupName) => {
        const groupProjects = grouped[groupName]
        const collapsed = collapsedGroups[groupName] ?? false
        return (
          <div key={groupName}>
            <button
              type="button"
              onClick={() => toggleGroup(groupName)}
              className="group-header"
            >
              <div className="group-header-name">
                <span className={`group-chevron ${collapsed ? 'collapsed' : ''}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </span>
                {groupName}
                <span className="group-stats">
                  {groupProjects.length} item{groupProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="group-header-track" />
            </button>

            {!collapsed &&
              groupProjects.map((project) => {
                const like = projectToProjectLike(project)
                const segments = buildGanttSegments(
                  like,
                  visibleMonths,
                  todayPosition,
                  workflowMilestones
                )
                const markers = buildMilestoneMarkers(like, visibleMonths, workflowMilestones)
                const status = getCurrentStatus(like, workflow, todayStr)
                const stateIndex = stateKeys.indexOf(status)
                const stateIndexClamp = stateIndex >= 0 ? Math.min(stateIndex, 7) : 0
                const stateItem = workflow.find((w) => w.type === 'state' && w.key === status)
                const depType = getDependencyType(project, projects)
                const depTooltip = depType
                  ? 'Blocked by: ' +
                    (project.dependencies?.map((d) => (typeof d === 'string' ? d : d.task)).join(', ') ?? '') +
                    (depType === 'outbound' || depType === 'both'
                      ? ' | Blocks: ' +
                        projects
                          .filter((p) => p.id !== project.id && p.dependencies?.some((d) => (typeof d === 'string' ? d : d.task) === project.name))
                          .map((p) => p.name)
                          .join(', ')
                      : '')
                  : ''
                const ganttTooltip = workflowMilestones
                  .map((m) => {
                    const dateStr = project.milestones?.[m.key]
                    return dateStr ? `${m.short}: ${formatDateDisplay(dateStr)}` : null
                  })
                  .filter(Boolean)
                  .join('\n')

                const isInDependencyGraph = dependencyGraphNodes.has(project.name)
                const isActiveDependency = activeDependencyGraph === project.name
                const dependencyRowClass =
                  activeDependencyGraph == null
                    ? ''
                    : isActiveDependency
                      ? 'dependency-active'
                      : isInDependencyGraph
                        ? 'dependency-highlight'
                        : 'dependency-dimmed'

                return (
                  <div
                    key={project.id}
                    className={`data-source-row ${(project.at_risk || redBlockedSet.has(project.name)) ? 'at-risk' : ''} ${project.descoped ? 'descoped' : ''} ${dependencyRowClass}`}
                  >
                    <div className={`source-name state-${stateIndexClamp}`}>
                      {(project.at_risk || redBlockedSet.has(project.name)) && (
                        <span className="risk-indicator" title="At risk">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z" />
                          </svg>
                        </span>
                      )}
                      <span className="source-name-text" title={project.name}>
                        {project.name}
                      </span>
                      {project.external_link?.trim() ? (
                        <a
                          className="info-link"
                          href={project.external_link.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="More info"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm9-3.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V8.25zm.75 2.25a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75H12z" clipRule="evenodd" />
                          </svg>
                        </a>
                      ) : null}
                      {depType && (
                        <button
                          type="button"
                          className={`dependency-icon ${depType} ${isActiveDependency ? 'active' : ''}`}
                          title={depTooltip}
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDependencyGraph((prev) => (prev === project.name ? null : project.name))
                          }}
                          aria-label={isActiveDependency ? 'Hide dependency graph' : 'Show dependency graph'}
                        >
                          {depType === 'inbound' ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3v7H6l6 8 6-8h-3.5V3z" /></svg>
                          ) : depType === 'outbound' ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 21v-7H18l-6-8-6 8h3.5v7z" /></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5-5 5 5H7zm0 4l5 5 5-5H7z" /></svg>
                          )}
                        </button>
                      )}
                      <span
                        className={`status-indicator state-${stateIndexClamp}`}
                        title={stateItem?.title ?? status}
                      >
                        {stateItem?.short ?? status}
                      </span>
                    </div>

                    <div
                      className="timeline-track relative"
                      title={ganttTooltip || undefined}
                    >
                      <GanttBar segments={segments} title={ganttTooltip || undefined} />
                      {visibleMonths.map((_, i) => {
                        const leftPct =
                          totalDays > 0
                            ? (visibleMonths.slice(0, i).reduce((s, mo) => s + mo.daysInMonth, 0) / totalDays) * 100
                            : (i / visibleMonths.length) * 100
                        return (
                          <div
                            key={i}
                            className="month-grid-line"
                            style={{ left: `${leftPct}%` }}
                          />
                        )
                      })}
                      {todayPosition != null && (
                        <div
                          className="today-guide-line"
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
        <div className="py-8 text-center text-color-text-light text-sm">
          No projects match the current filters.
        </div>
      )}
      <DependencyArrows
        containerRef={arrowsContainerRef}
        projects={projects}
        activeProjectName={activeDependencyGraph}
        showRiskOnlyRed={safeFilter.riskOnly}
        visibleProjectNames={visibleProjectNames}
        visibleMonths={visibleMonths}
        workflowMilestones={workflowMilestones}
      />
      </div>
      </div>
    </div>
  )
})

export default GanttTimeline
