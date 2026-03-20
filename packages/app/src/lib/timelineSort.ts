/**
 * Timeline row ordering — mirrors Lite `sortDeliverables` (filterBar.js).
 */

import type { Project, WorkflowItem } from '../api/client'
import type { WorkflowMilestone } from './timeline'
import { parseDate, getCurrentStatus } from './stats'
import {
  getBlockedByRedDependencySet,
  getWorkflowMilestones,
  projectToProjectLike,
} from './projectFilters'

export type TimelineSortBy = 'name' | 'status' | 'm3date' | 'risk'
export type TimelineSortOrder = 'asc' | 'desc'

export interface TimelineSortState {
  by: TimelineSortBy
  order: TimelineSortOrder
}

/** Lite AppState default sort is m3date asc; SaaS timeline matches that. */
export const defaultTimelineSort: TimelineSortState = { by: 'm3date', order: 'asc' }

export function getLastMilestoneKeyForWorkflow(workflow: WorkflowItem[]): string {
  const m = getWorkflowMilestones(workflow)
  return m[m.length - 1]?.key ?? 'M3'
}

/** at_risk OR blocked by red dependency (same as Lite getEffectiveAtRiskSet). */
export function getEffectiveAtRiskProjectSet(
  allProjects: Project[],
  workflowMilestones: WorkflowMilestone[]
): Set<string> {
  const redBlocked = getBlockedByRedDependencySet(allProjects, workflowMilestones)
  const set = new Set<string>()
  for (const p of allProjects) {
    if (p.at_risk || redBlocked.has(p.name)) set.add(p.name)
  }
  return set
}

export function sortTimelineProjects(
  filteredProjects: Project[],
  allProjects: Project[],
  workflow: WorkflowItem[],
  todayStr: string,
  sort: TimelineSortState
): Project[] {
  if (workflow.length === 0) return [...filteredProjects]

  const workflowMilestones = getWorkflowMilestones(workflow)
  const stateKeys = workflow.filter((w) => w.type === 'state').map((w) => w.key)
  const lastMilestoneKey = getLastMilestoneKeyForWorkflow(workflow)
  const atRiskSet = getEffectiveAtRiskProjectSet(allProjects, workflowMilestones)
  const farFuture = new Date(9999, 11, 31)

  const sorted = [...filteredProjects]
  sorted.sort((a, b) => {
    let comparison = 0
    switch (sort.by) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '')
        break
      case 'status': {
        const statusA = stateKeys.indexOf(getCurrentStatus(projectToProjectLike(a), workflow, todayStr))
        const statusB = stateKeys.indexOf(getCurrentStatus(projectToProjectLike(b), workflow, todayStr))
        comparison = statusA - statusB
        break
      }
      case 'm3date': {
        const dateA = parseDate(a.milestones?.[lastMilestoneKey] ?? null) ?? farFuture
        const dateB = parseDate(b.milestones?.[lastMilestoneKey] ?? null) ?? farFuture
        comparison = dateA.getTime() - dateB.getTime()
        break
      }
      case 'risk':
        comparison =
          (atRiskSet.has(b.name) ? 1 : 0) - (atRiskSet.has(a.name) ? 1 : 0)
        break
      default:
        break
    }
    return sort.order === 'desc' ? -comparison : comparison
  })
  return sorted
}
