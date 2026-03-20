import { useState, useMemo, useRef, useEffect } from 'react'
import type { Project, Workspace, WorkflowItem } from '../../api/client'
import {
  generateMonths,
  generateVisibleMonthsForZoom,
  calculatePosition,
  getTodayStr,
  buildMilestoneMarkers,
  buildGanttSegments,
  formatDateDisplay,
  parseDate,
  type MonthInfo,
  type ProjectLike,
  type WorkflowMilestone,
} from '../../lib/timeline'
import { getCurrentStatus } from '../../lib/stats'
import { exportToPNG, exportToCSV, exportToJSON } from '../../lib/export'
import { getDependencyGraph } from '../../lib/dependencyGraph'
import GanttBar from './GanttBar'
import MilestoneMarkerComponent from './MilestoneMarker'
import KeyMilestones from './KeyMilestones'
import DependencyArrows from './DependencyArrows'

export type ZoomPreset = '3m' | '6m' | '12m' | 'all'

export interface GanttFilter {
  search: string
  statusFilter: string
  riskOnly: boolean
  descopedOnly: boolean
}

interface GanttTimelineProps {
  projects: Project[]
  workspace: Workspace | null
  filter?: GanttFilter
  onFilterChange?: (f: GanttFilter) => void
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

function getMilestoneDateStr(project: Project, milestoneKey: string, firstKey: string): string | null {
  const m = project.milestones?.[milestoneKey]
  if (m) return m
  if (milestoneKey === firstKey && project.milestones?.START) return project.milestones.START
  return null
}

function getBlockedByRedDependencySet(projects: Project[], workflowMilestones: WorkflowMilestone[]): Set<string> {
  const blocked = new Set<string>()
  const firstKey = workflowMilestones[0]?.key ?? 'START'
  const lastKey = workflowMilestones[workflowMilestones.length - 1]?.key ?? 'M3'
  const nameToProject = new Map(projects.map((p) => [p.name, p]))
  projects.forEach((toProject) => {
    ;(toProject.dependencies ?? []).forEach((dep) => {
      const fromName = typeof dep === 'string' ? dep : dep.task
      const fromProject = nameToProject.get(fromName)
      if (!fromProject) return
      const fromKey = typeof dep === 'object' && dep?.from ? dep.from : lastKey
      const toKey = typeof dep === 'object' && dep?.to ? dep.to : firstKey
      const fromDate = parseDate(getMilestoneDateStr(fromProject, fromKey, firstKey))
      const toDate = parseDate(getMilestoneDateStr(toProject, toKey, firstKey))
      if (!fromDate || !toDate) return
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (fromDate.getTime() <= today.getTime()) return
      if (fromDate.getTime() > toDate.getTime()) blocked.add(toProject.name)
    })
  })
  return blocked
}

function getRedDependencyEndpointSet(projects: Project[], workflowMilestones: WorkflowMilestone[]): Set<string> {
  const endpoints = new Set<string>()
  const firstKey = workflowMilestones[0]?.key ?? 'START'
  const lastKey = workflowMilestones[workflowMilestones.length - 1]?.key ?? 'M3'
  const nameToProject = new Map(projects.map((p) => [p.name, p]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  projects.forEach((toProject) => {
    ;(toProject.dependencies ?? []).forEach((dep) => {
      const fromName = typeof dep === 'string' ? dep : dep.task
      const fromProject = nameToProject.get(fromName)
      if (!fromProject) return
      const fromKey = typeof dep === 'object' && dep?.from ? dep.from : lastKey
      const toKey = typeof dep === 'object' && dep?.to ? dep.to : firstKey
      const fromDate = parseDate(getMilestoneDateStr(fromProject, fromKey, firstKey))
      const toDate = parseDate(getMilestoneDateStr(toProject, toKey, firstKey))
      if (!fromDate || !toDate) return
      if (fromDate.getTime() <= today.getTime()) return
      if (fromDate.getTime() > toDate.getTime()) {
        endpoints.add(fromProject.name)
        endpoints.add(toProject.name)
      }
    })
  })
  return endpoints
}

export default function GanttTimeline({
  projects,
  workspace,
  filter = { search: '', statusFilter: 'ALL', riskOnly: false, descopedOnly: false },
  onFilterChange,
  zoom: zoomProp = 'all',
}: GanttTimelineProps) {
  const [zoom, setZoom] = useState<ZoomPreset>(zoomProp)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [activeDependencyGraph, setActiveDependencyGraph] = useState<string | null>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const arrowsContainerRef = useRef<HTMLDivElement>(null)
  const safeFilter = filter ?? { search: '', statusFilter: 'ALL', riskOnly: false, descopedOnly: false }
  const hasActiveFilters =
    safeFilter.statusFilter !== 'ALL' ||
    safeFilter.riskOnly ||
    safeFilter.descopedOnly ||
    !!safeFilter.search?.trim()

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

  const filteredProjects = useMemo(() => {
    const redBlockedSet = getBlockedByRedDependencySet(projects, workflowMilestones)
    const redEndpointsSet = getRedDependencyEndpointSet(projects, workflowMilestones)
    let list = projects.filter((p) => p.show_in_timeline !== false)
    if (safeFilter.search.trim()) {
      const q = safeFilter.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    }
    if (safeFilter.statusFilter !== 'ALL') {
      list = list.filter(
        (p) => getCurrentStatus(projectToProjectLike(p), workflow, todayStr) === safeFilter.statusFilter
      )
    }
    if (safeFilter.riskOnly) {
      list = list.filter((p) => p.at_risk === true || redBlockedSet.has(p.name) || redEndpointsSet.has(p.name))
    }
    if (safeFilter.descopedOnly) {
      list = list.filter((p) => p.descoped === true)
    }
    return list
  }, [projects, safeFilter, workflow, todayStr, workflowMilestones])

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
    filteredProjects.forEach((p) => {
      const g = p.group_name ?? '(No group)'
      if (!groups[g]) groups[g] = []
      groups[g].push(p)
    })
    return groups
  }, [filteredProjects])

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
  }, [safeFilter.search, safeFilter.statusFilter, safeFilter.riskOnly, safeFilter.descopedOnly])

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

  const stateKeys = useMemo(
    () => workflow.filter((w) => w.type === 'state').map((w) => w.key),
    [workflow]
  )

  const clearFilters = () =>
    onFilterChange?.({
      search: '',
      statusFilter: 'ALL',
      riskOnly: false,
      descopedOnly: false,
    })

  const expandAll = () => setCollapsedGroups({})
  const collapseAll = () => {
    const next: Record<string, boolean> = {}
    groupNames.forEach((g) => (next[g] = true))
    setCollapsedGroups(next)
  }

  const handleExportPNG = () => {
    exportToPNG(timelineContainerRef.current, 'Timeline').catch(console.error)
  }
  const handleExportCSV = () => exportToCSV(filteredProjects, workflow, todayStr)
  const handleExportJSON = () =>
    exportToJSON(filteredProjects, workspace, workflow, todayStr)

  return (
    <div className="timeline-view">
      {/* Key milestones — above toolbar */}
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

      {/* Single toolbar: zoom, search, status, risk, descope, clear, group, export */}
      <div className="filter-bar">
        <div className="filter-group zoom-controls">
          <span className="filter-label">Zoom:</span>
          {(['3m', '6m', '12m', 'all'] as const).map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => {
                setZoom(z)
                setActiveDependencyGraph(null)
              }}
              className={`zoom-btn ${zoom === z ? 'active' : ''}`}
            >
              {z === 'all' ? 'All' : z.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by name..."
            value={safeFilter.search}
            onChange={(e) => onFilterChange?.({ ...safeFilter, search: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <select
            className="filter-select"
            value={safeFilter.statusFilter}
            onChange={(e) => onFilterChange?.({ ...safeFilter, statusFilter: e.target.value })}
          >
            <option value="ALL">All</option>
            {stateKeys.map((k) => {
              const s = workflow.find((w) => w.type === 'state' && w.key === k)
              return (
                <option key={k} value={k}>
                  {s?.short ?? k}
                </option>
              )}
            )}
          </select>
        </div>
        <div className="filter-group">
          <button
            type="button"
            className={`filter-toggle ${safeFilter.riskOnly ? 'active' : ''}`}
            onClick={() => onFilterChange?.({ ...safeFilter, riskOnly: !safeFilter.riskOnly, descopedOnly: false })}
          >
            At Risk
          </button>
        </div>
        <div className="filter-group">
          <button
            type="button"
            className={`filter-toggle ${safeFilter.descopedOnly ? 'active' : ''}`}
            onClick={() => onFilterChange?.({ ...safeFilter, descopedOnly: !safeFilter.descopedOnly, riskOnly: false })}
          >
            Descoped
          </button>
        </div>
        {hasActiveFilters && (
          <button type="button" className="filter-clear" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
        {groupNames.length > 0 && (
          <div className="group-controls">
            <button type="button" className="group-control-btn" onClick={expandAll}>
              Expand All
            </button>
            <button type="button" className="group-control-btn" onClick={collapseAll}>
              Collapse All
            </button>
          </div>
        )}
        <div className="export-controls">
          <button type="button" className="export-btn" onClick={handleExportPNG}>
            Export PNG
          </button>
          <button type="button" className="export-btn secondary" onClick={handleExportCSV}>
            CSV
          </button>
          <button type="button" className="export-btn secondary" onClick={handleExportJSON}>
            JSON
          </button>
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
        visibleMonths={visibleMonths}
        workflowMilestones={workflowMilestones}
      />
      </div>
      </div>
    </div>
  )
}
