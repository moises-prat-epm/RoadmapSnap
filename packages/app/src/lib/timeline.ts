/**
 * Pure timeline and Gantt data transformation (ported from js/core/timeline.js + viewModel.js).
 * No DOM, no globals — all data passed in. Used by GanttTimeline React component.
 */

export interface MonthInfo {
  date: Date
  name: string
  daysInMonth: number
}

export interface WorkflowMilestone {
  type: 'milestone'
  key: string
  short: string
  title: string
  subtitle?: string
}

export interface ProjectLike {
  name: string
  group?: string | null
  milestones: Record<string, string>
  at_risk?: boolean
  show_in_timeline?: boolean
  tags?: string[]
  /** Optional; used when first milestone key is START and milestones.START is not set */
  startDate?: string
}

export interface MilestoneMarker {
  position: number
  slotClass: string
  short: string
  date: string
  hideLabel: boolean
}

export interface GanttSegment {
  startPct: number
  widthPct: number
  /** For shared CSS: 'start' | 'm0' | 'm1' | ... | 'm5' */
  segmentClass: string
  isFuture: boolean
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse DD/MM/YYYY to Date, or null if invalid. */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const parts = String(dateStr).trim().split('/').map(Number)
  if (parts.length < 3) return null
  const [day, month, year] = parts
  if (!year || !month || month < 1 || month > 12 || !day || day < 1) return null
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) return null
  return date
}

/** DD/MM/YYYY → "15 Jan" */
export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  const day = parseInt(parts[0], 10)
  const monthIndex = parseInt(parts[1], 10) - 1
  if (isNaN(day) || monthIndex < 0 || monthIndex > 11) return ''
  return `${day} ${MONTH_NAMES[monthIndex]}`
}

/** DD/MM/YYYY → "15 Jan 2026" */
export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  const day = parseInt(parts[0], 10)
  const monthIndex = parseInt(parts[1], 10) - 1
  const year = parts[2] ?? ''
  if (isNaN(day) || monthIndex < 0 || monthIndex > 11) return ''
  return `${day} ${MONTH_NAMES[monthIndex]} ${year}`
}

/** Parse MM/YYYY to first day of month. */
function parseMonthYear(monthYearStr: string): Date {
  const parts = monthYearStr.split('/').map(Number)
  const [month, year] = parts.length === 2 ? [parts[0], parts[1]] : [1, new Date().getFullYear()]
  return new Date(year, month - 1, 1)
}

function getMonthName(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

/** Generate month metadata between startMonth and endMonth (MM/YYYY). */
export function generateMonths(startMonth: string, endMonth: string): MonthInfo[] {
  const months: MonthInfo[] = []
  const start = parseMonthYear(startMonth)
  const end = parseMonthYear(endMonth)
  const current = new Date(start.getTime())
  while (current <= end) {
    months.push({
      date: new Date(current.getTime()),
      name: getMonthName(current),
      daysInMonth: new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate(),
    })
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

/** Position of a date in the timeline as percentage 0..100. */
export function calculatePosition(dateStr: string | null | undefined, months: MonthInfo[]): number | null {
  const date = parseDate(dateStr)
  if (!date || months.length === 0) return null
  const timelineStart = months[0].date
  const timelineEnd = new Date(months[months.length - 1].date)
  timelineEnd.setMonth(timelineEnd.getMonth() + 1)
  const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
  const daysFromStart = (date.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100))
}

/** Whether the given date falls within the timeline range. */
export function isDateInRange(date: Date, months: MonthInfo[]): boolean {
  if (!date || months.length === 0) return false
  const timelineStart = months[0].date
  const timelineEnd = new Date(months[months.length - 1].date)
  timelineEnd.setMonth(timelineEnd.getMonth() + 1)
  return date.getTime() >= timelineStart.getTime() && date.getTime() <= timelineEnd.getTime()
}

function getFirstMilestoneKey(milestones: WorkflowMilestone[]): string {
  return milestones[0]?.key ?? 'START'
}

function getMilestoneDate(project: ProjectLike, milestoneKey: string, firstKey: string): string | null {
  const m = project.milestones?.[milestoneKey]
  if (m) return m
  if (milestoneKey === firstKey && project.startDate) return project.startDate
  if (milestoneKey === firstKey && project.milestones?.START) return project.milestones.START
  return null
}

/** Build milestone markers for a project (deduplicated when too close). */
export function buildMilestoneMarkers(
  project: ProjectLike,
  months: MonthInfo[],
  workflowMilestones: WorkflowMilestone[]
): MilestoneMarker[] {
  const MILESTONE_OVERLAP_THRESHOLD_PCT = 4
  const firstKey = getFirstMilestoneKey(workflowMilestones)
  const startDate = getMilestoneDate(project, firstKey, firstKey)
  const startMilestone = workflowMilestones.find((m) => m.key === firstKey)
  const allMarkers: Array<{ position: number; slotClass: string; short: string; date: string }> = []

  if (startDate) {
    const startDateParsed = parseDate(startDate)
    if (startDateParsed && isDateInRange(startDateParsed, months)) {
      const position = calculatePosition(startDate, months) ?? 0
      allMarkers.push({
        position,
        slotClass: 'start',
        short: startMilestone?.short ?? 'GO',
        date: startDate,
      })
    }
  }

  const nonFirst = workflowMilestones.filter((m) => m.key !== firstKey)
  nonFirst.forEach((m, i) => {
    const dateStr = getMilestoneDate(project, m.key, firstKey)
    if (!dateStr) return
    const date = parseDate(dateStr)
    if (!date || !isDateInRange(date, months)) return
    const pos = calculatePosition(dateStr, months) ?? 0
    const slotClass = 'm' + Math.min(i, 5)
    allMarkers.push({ position: pos, slotClass, short: m.short, date: dateStr })
  })

  allMarkers.sort((a, b) => a.position - b.position)
  const keepIndex = new Set<number>()
  let i = 0
  while (i < allMarkers.length) {
    let j = i
    while (j + 1 < allMarkers.length && allMarkers[j + 1].position - allMarkers[j].position < MILESTONE_OVERLAP_THRESHOLD_PCT) {
      j++
    }
    keepIndex.add(j)
    i = j + 1
  }

  return allMarkers
    .filter((_, idx) => keepIndex.has(idx))
    .map((m) => ({
      position: m.position,
      slotClass: m.slotClass,
      short: m.short,
      date: m.date,
      hideLabel: m.position < 2,
    }))
}

/** Build Gantt bar segments (past vs future) for a project. */
export function buildGanttSegments(
  project: ProjectLike,
  months: MonthInfo[],
  todayPosition: number | null,
  workflowMilestones: WorkflowMilestone[]
): GanttSegment[] {
  const segments: Array<{ left: number; width: number; segmentClass: string; isFuture: boolean }> = []
  const firstKey = getFirstMilestoneKey(workflowMilestones)
  const startDate = getMilestoneDate(project, firstKey, firstKey)
  const startDatePos = startDate ? calculatePosition(startDate, months) : null
  const milestonePositions: Record<string, number | null> = {}
  workflowMilestones.forEach((m) => {
    const date = getMilestoneDate(project, m.key, firstKey)
    milestonePositions[m.key] = date ? calculatePosition(date, months) : null
  })

  function addSegment(
    start: number | null,
    end: number | null,
    milestoneSlot: number
  ): void {
    if (start === null || end === null || end <= start) return
    const segClass = milestoneSlot === 0 ? 'segment-start' : 'segment-m' + (milestoneSlot - 1)
    const w = end - start
    const pastWidth = todayPosition != null ? Math.min(w, Math.max(0, todayPosition - start)) : 0
    const futureWidth = w - pastWidth
    if (pastWidth > 0) {
      segments.push({ left: start, width: pastWidth, segmentClass: segClass, isFuture: false })
    }
    if (futureWidth > 0) {
      segments.push({ left: start + pastWidth, width: futureWidth, segmentClass: segClass, isFuture: true })
    }
  }

  for (let i = 0; i < workflowMilestones.length; i++) {
    const current = workflowMilestones[i]
    const currentPos = milestonePositions[current.key]
    const slot = i
    if (i === 0) {
      if (currentPos != null) {
        const segStart = startDatePos != null ? startDatePos : Math.max(0, currentPos - 5)
        addSegment(segStart, currentPos, slot)
      }
    }
    if (i < workflowMilestones.length - 1) {
      const next = workflowMilestones[i + 1]
      const nextPos = milestonePositions[next.key]
      addSegment(currentPos ?? null, nextPos ?? null, slot)
    }
  }

  return segments.map((seg) => ({
    startPct: seg.left,
    widthPct: seg.width,
    segmentClass: seg.segmentClass, // 'segment-start' | 'segment-m0' | ...
    isFuture: seg.isFuture,
  }))
}

/** Today as DD/MM/YYYY. */
export function getTodayStr(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}
