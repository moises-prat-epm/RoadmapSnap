/**
 * Shared project filtering for timeline (Gantt) and project list views.
 * Mirrors GanttTimeline filter semantics.
 */

import type { Project, WorkflowItem, Workspace } from '../api/client'
import type { WorkflowMilestone } from './timeline'
import { parseDate } from './stats'
import { getCurrentStatus, type ProjectForStats } from './stats'

export interface WorkspaceProjectFilter {
  search: string
  statusFilter: string
  riskOnly: boolean
  descopedOnly: boolean
}

export function getWorkflowMilestones(workflow: WorkflowItem[]): WorkflowMilestone[] {
  return workflow.filter((item): item is WorkflowMilestone => item.type === 'milestone')
}

export function projectToProjectLike(p: Project): ProjectForStats {
  return {
    name: p.name,
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
    descoped: p.descoped,
  }
}

function getMilestoneDateStr(project: Project, milestoneKey: string, firstKey: string): string | null {
  const m = project.milestones?.[milestoneKey]
  if (m) return m
  if (milestoneKey === firstKey && project.milestones?.START) return project.milestones.START
  return null
}

export function getBlockedByRedDependencySet(projects: Project[], workflowMilestones: WorkflowMilestone[]): Set<string> {
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

export function getRedDependencyEndpointSet(projects: Project[], workflowMilestones: WorkflowMilestone[]): Set<string> {
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

export type ProjectFilterMode = 'timeline' | 'list'

/**
 * Apply the same filter rules as Gantt timeline.
 * - `timeline`: only projects with show_in_timeline !== false (default for Gantt).
 * - `list`: all projects; use for the full workspace table.
 */
export function applyProjectFilters(
  projects: Project[],
  workflow: WorkflowItem[],
  filter: WorkspaceProjectFilter,
  todayStr: string,
  mode: ProjectFilterMode
): Project[] {
  const workflowMilestones = getWorkflowMilestones(workflow)
  const redBlockedSet = getBlockedByRedDependencySet(projects, workflowMilestones)
  const redEndpointsSet = getRedDependencyEndpointSet(projects, workflowMilestones)
  let list = mode === 'timeline' ? projects.filter((p) => p.show_in_timeline !== false) : [...projects]
  if (filter.search.trim()) {
    const q = filter.search.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
    )
  }
  if (filter.statusFilter !== 'ALL') {
    list = list.filter(
      (p) => getCurrentStatus(projectToProjectLike(p), workflow, todayStr) === filter.statusFilter
    )
  }
  if (filter.riskOnly) {
    list = list.filter((p) => p.at_risk === true || redBlockedSet.has(p.name) || redEndpointsSet.has(p.name))
  }
  if (filter.descopedOnly) {
    list = list.filter((p) => p.descoped === true)
  }
  return list
}

export function countTimelineEligible(projects: Project[]): number {
  return projects.filter((p) => p.show_in_timeline !== false).length
}

/** Timeline-visible projects that match risk-only filter semantics (Lite + SaaS: at-risk, red blocked, red endpoints). */
export function countTimelineRiskSignaledProjects(projects: Project[], workflow: WorkflowItem[]): number {
  if (projects.length === 0 || workflow.length === 0) return 0
  const workflowMilestones = getWorkflowMilestones(workflow)
  const redBlockedSet = getBlockedByRedDependencySet(projects, workflowMilestones)
  const redEndpointsSet = getRedDependencyEndpointSet(projects, workflowMilestones)
  return projects.filter(
    (p) =>
      p.show_in_timeline !== false &&
      (p.at_risk === true || redBlockedSet.has(p.name) || redEndpointsSet.has(p.name))
  ).length
}

/** Timeline-visible descoped projects (show Descoped filter when any exist). */
export function countTimelineDescopedProjects(projects: Project[]): number {
  return projects.filter((p) => p.show_in_timeline !== false && p.descoped === true).length
}

/** All workspace projects matching risk-only semantics (Projects tab / list mode). */
export function countListRiskSignaledProjects(projects: Project[], workflow: WorkflowItem[]): number {
  if (projects.length === 0 || workflow.length === 0) return 0
  const workflowMilestones = getWorkflowMilestones(workflow)
  const redBlockedSet = getBlockedByRedDependencySet(projects, workflowMilestones)
  const redEndpointsSet = getRedDependencyEndpointSet(projects, workflowMilestones)
  return projects.filter(
    (p) => p.at_risk === true || redBlockedSet.has(p.name) || redEndpointsSet.has(p.name)
  ).length
}

export function countListDescopedProjects(projects: Project[]): number {
  return projects.filter((p) => p.descoped === true).length
}

/** Distinct group names for filtered timeline projects (same ordering as Gantt). */
export function getTimelineGroupNames(
  projects: Project[],
  workflow: WorkflowItem[],
  filter: WorkspaceProjectFilter,
  todayStr: string,
  workspace: Workspace | null
): string[] {
  const filtered = applyProjectFilters(projects, workflow, filter, todayStr, 'timeline')
  const namesSet = new Set<string>()
  for (const p of filtered) {
    namesSet.add(p.group_name ?? '(No group)')
  }
  const names = [...namesSet]
  const groupOrder = (workspace?.settings as { group_order?: string[] } | undefined)?.group_order
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
}

/** Milestone date string for a project (START alias for first milestone). */
export function getMilestoneDateStrForProject(
  project: Project,
  milestoneKey: string,
  workflow: WorkflowItem[]
): string | null {
  const milestones = getWorkflowMilestones(workflow)
  const firstKey = milestones[0]?.key ?? 'START'
  const m = project.milestones?.[milestoneKey]
  if (m) return m
  if (milestoneKey === firstKey && project.milestones?.START) return project.milestones.START
  return null
}
