/**
 * Pure stat calculation logic for RoadmapSnap (ported from js/core/stats.js + workflow.js).
 * No DOM, no globals — all data passed in.
 */

export interface WorkflowItem {
  type: 'state' | 'milestone'
  key: string
  short: string
  title: string
  description?: string
  subtitle?: string
}

export interface ProjectForStats {
  name?: string
  milestones: Record<string, string>
  at_risk?: boolean
  show_in_timeline?: boolean
  descoped?: boolean
}

export interface StatsResult {
  total: number
  atRisk: number
  descoped: number
  completionPercentage: number
  visibleByStatus: Record<string, number>
  stateKeys: string[]
}

/** Parse DD/MM/YYYY to Date, or null if invalid. */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const parts = String(dateStr).trim().split('/').map(Number)
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  if (!year || !month || month < 1 || month > 12 || !day || day < 1) return null
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) return null
  return date
}

/** Today as DD/MM/YYYY. */
export function getTodayStr(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

function getStates(workflow: WorkflowItem[]): WorkflowItem[] {
  return workflow.filter((item) => item.type === 'state')
}

function getMilestones(workflow: WorkflowItem[]): WorkflowItem[] {
  return workflow.filter((item) => item.type === 'milestone')
}

function getFirstMilestoneKey(workflow: WorkflowItem[]): string {
  const milestones = getMilestones(workflow)
  return milestones[0]?.key ?? 'START'
}

function getLastState(workflow: WorkflowItem[]): WorkflowItem {
  const states = getStates(workflow)
  return states[states.length - 1] ?? { type: 'state', key: 'DONE', short: 'DONE', title: 'Done' }
}

function getFirstState(workflow: WorkflowItem[]): WorkflowItem {
  const states = getStates(workflow)
  return states[0] ?? { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' }
}

function getStateAfterMilestone(milestoneKey: string, workflow: WorkflowItem[]): WorkflowItem | null {
  const idx = workflow.findIndex((item) => item.type === 'milestone' && item.key === milestoneKey)
  if (idx === -1) return null
  for (let i = idx + 1; i < workflow.length; i++) {
    if (workflow[i].type === 'state') return workflow[i]
  }
  return null
}

function getMilestoneDate(project: ProjectForStats, milestoneKey: string, workflow: WorkflowItem[]): string | null {
  if (project.milestones?.[milestoneKey]) return project.milestones[milestoneKey]
  const firstKey = getFirstMilestoneKey(workflow)
  if (milestoneKey === firstKey && project.milestones?.START) return project.milestones.START
  return null
}

/**
 * Current status key (state) for a project given workflow and today.
 */
export function getCurrentStatus(
  project: ProjectForStats,
  workflow: WorkflowItem[],
  todayStr: string
): string {
  const today = parseDate(todayStr)
  if (!today) return getFirstState(workflow).key
  const milestones = getMilestones(workflow)
  for (let i = milestones.length - 1; i >= 0; i--) {
    const milestone = milestones[i]
    const dateStr = getMilestoneDate(project, milestone.key, workflow)
    const milestoneDate = parseDate(dateStr)
    if (milestoneDate && today >= milestoneDate) {
      const nextState = getStateAfterMilestone(milestone.key, workflow)
      return nextState ? nextState.key : getLastState(workflow).key
    }
  }
  return getFirstState(workflow).key
}

/**
 * Compute KPIs from projects and workflow.
 * Excludes descoped from totals and completion; at_risk and show_in_timeline respected.
 */
export function calculateStats(
  projects: ProjectForStats[],
  workflow: WorkflowItem[],
  todayStr: string
): StatsResult {
  const states = getStates(workflow)
  const lastState = getLastState(workflow)
  const lastStateKey = lastState.key

  const kpiProjects = projects.filter((p) => !p.descoped)
  const descoped = projects.filter((p) => p.descoped).length
  const visibleByStatus: Record<string, number> = {}
  states.forEach((s) => {
    visibleByStatus[s.key] = 0
  })

  let atRisk = 0
  kpiProjects.forEach((project) => {
    const status = getCurrentStatus(project, workflow, todayStr)
    if (visibleByStatus[status] !== undefined) visibleByStatus[status]++
    if (project.at_risk) atRisk++
  })

  const total = kpiProjects.length
  const completionPercentage = total === 0 ? 0 : Math.round((visibleByStatus[lastStateKey] ?? 0) / total * 100)

  return {
    total,
    atRisk,
    descoped,
    completionPercentage,
    visibleByStatus,
    stateKeys: states.map((s) => s.key),
  }
}

export interface UpcomingMilestone {
  source: string
  date: string
  atRisk: boolean
}

/** For each workflow milestone, the nearest future (or today) project date. */
export function getUpcomingMilestones(
  projects: ProjectForStats[],
  workflow: WorkflowItem[],
  todayStr: string
): Record<string, UpcomingMilestone | undefined> {
  const today = parseDate(todayStr)
  const milestones = getMilestones(workflow)
  const visible = projects.filter((p) => p.show_in_timeline !== false)
  const result: Record<string, UpcomingMilestone | undefined> = {}
  milestones.forEach((m) => {
    let nearest: UpcomingMilestone | null = null
    let nearestDate: Date | null = null
    visible.forEach((proj) => {
      const name = proj.name
      if (!name) return
      const dateStr = getMilestoneDate(proj, m.key, workflow)
      const date = parseDate(dateStr)
      if (date && today && date >= today) {
        if (!nearestDate || date < nearestDate) {
          nearestDate = date
          nearest = { source: name, date: dateStr!, atRisk: proj.at_risk ?? false }
        }
      }
    })
    if (nearest) result[m.key] = nearest
  })
  return result
}
