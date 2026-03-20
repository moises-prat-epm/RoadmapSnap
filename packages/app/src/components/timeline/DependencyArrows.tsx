import { useLayoutEffect, useState } from 'react'
import type { Project } from '../../api/client'
import type { MonthInfo, WorkflowMilestone } from '../../lib/timeline'
import { calculatePosition, formatDateDisplay, isDateInRange, parseDate } from '../../lib/timeline'
import { getDependencyGraph } from '../../lib/dependencyGraph'

export interface ArrowPath {
  d: string
  type: 'inbound' | 'outbound'
  tooltip: string
  color: string
  markerEnd: string
}

function getFirstMilestoneKey(milestones: WorkflowMilestone[]): string {
  return milestones[0]?.key ?? 'START'
}

function getLastMilestoneKey(milestones: WorkflowMilestone[]): string {
  return milestones[milestones.length - 1]?.key ?? 'M3'
}

function getMilestoneDateStr(
  project: Project,
  milestoneKey: string,
  firstKey: string
): string | null {
  const m = project.milestones?.[milestoneKey]
  if (m) return m
  if (milestoneKey === firstKey && project.milestones?.START) return project.milestones.START
  return null
}

/** Match .data-source-row grid: first column width so we don't cover the dependency icon. */
const LABEL_COLUMN_WIDTH = 250

interface DependencyArrowsProps {
  containerRef: React.RefObject<HTMLElement | null>
  projects: Project[]
  /** When null, no arrows are drawn. When set, draw full graph from this project (Lite behavior). */
  activeProjectName: string | null
  showRiskOnlyRed: boolean
  /** Only draw edges between projects currently shown as rows (e.g. after filters). */
  visibleProjectNames?: ReadonlySet<string>
  visibleMonths: MonthInfo[]
  workflowMilestones: WorkflowMilestone[]
}

export default function DependencyArrows({
  containerRef,
  projects,
  activeProjectName,
  showRiskOnlyRed,
  visibleProjectNames,
  visibleMonths,
  workflowMilestones,
}: DependencyArrowsProps) {
  const [paths, setPaths] = useState<ArrowPath[]>([])
  const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useLayoutEffect(() => {
    if ((!activeProjectName && !showRiskOnlyRed) || visibleMonths.length === 0) {
      setPaths([])
      return
    }

    const container = containerRef.current
    if (!container) {
      setPaths([])
      return
    }

    const graph = activeProjectName ? getDependencyGraph(activeProjectName, projects) : null
    const allInboundEdges = graph
      ? graph.inboundEdges
      : projects.flatMap((to) =>
          (to.dependencies ?? []).map((dep) => ({
            from: typeof dep === 'string' ? dep : dep.task,
            to: to.name,
            fromMilestone: typeof dep === 'object' ? dep.from : undefined,
            toMilestone: typeof dep === 'object' ? dep.to : undefined,
          }))
        )
    const allEdgesRaw = [...allInboundEdges, ...(graph ? graph.outboundEdges : [])]
    const allEdges =
      visibleProjectNames != null
        ? allEdgesRaw.filter(
            (e) => visibleProjectNames.has(e.from) && visibleProjectNames.has(e.to)
          )
        : allEdgesRaw
    const nameToProject = new Map(projects.map((p) => [p.name, p]))
    const firstKey = getFirstMilestoneKey(workflowMilestones)
    const lastKey = getLastMilestoneKey(workflowMilestones)

    const rows = container.querySelectorAll('.data-source-row')
    const nameToRow = new Map<string, Element>()
    rows.forEach((row) => {
      const nameEl = row.querySelector('.source-name-text')
      const name = nameEl?.textContent?.trim()
      if (name) nameToRow.set(name, row)
    })

    const containerRect = container.getBoundingClientRect()
    const newPaths: ArrowPath[] = []

    allEdges.forEach((edge) => {
      const fromRow = nameToRow.get(edge.from)
      const toRow = nameToRow.get(edge.to)
      if (!fromRow || !toRow) return

      const fromProject = nameToProject.get(edge.from)
      const toProject = nameToProject.get(edge.to)
      if (!fromProject || !toProject) return

      const fromTrack = fromRow.querySelector('.timeline-track')
      const toTrack = toRow.querySelector('.timeline-track')
      const fromRect = fromRow.getBoundingClientRect()
      const toRect = toRow.getBoundingClientRect()
      const fromTrackRect = fromTrack ? fromTrack.getBoundingClientRect() : fromRect
      const toTrackRect = toTrack ? toTrack.getBoundingClientRect() : toRect

      const fromMilestoneKey = edge.fromMilestone ?? lastKey
      const toMilestoneKey = edge.toMilestone ?? firstKey
      const fromDateStr = getMilestoneDateStr(fromProject, fromMilestoneKey, firstKey)
      const toDateStr = getMilestoneDateStr(toProject, toMilestoneKey, firstKey)
      const fromDate = fromDateStr ? parseDate(fromDateStr) : null
      const toDate = toDateStr ? parseDate(toDateStr) : null

      let fromXPercent: number
      let toXPercent: number

      if (fromDateStr && toDateStr) {
        const fromInRange = fromDate != null && isDateInRange(fromDate, visibleMonths)
        const toInRange = toDate != null && isDateInRange(toDate, visibleMonths)
        if (!fromInRange || !toInRange) return

        const fromPct = calculatePosition(fromDateStr, visibleMonths)
        const toPct = calculatePosition(toDateStr, visibleMonths)
        if (fromPct == null || toPct == null) return
        fromXPercent = fromPct
        toXPercent = toPct
      } else {
        fromXPercent = 100
        toXPercent = 0
      }

      const fromTrackWidth = fromTrackRect.width
      const toTrackWidth = toTrackRect.width
      const fromX = fromTrackRect.left - containerRect.left + (fromTrackWidth * fromXPercent) / 100
      const toX = toTrackRect.left - containerRect.left + (toTrackWidth * toXPercent) / 100
      // Use track vertical center so arrows align with milestone markers (they sit at 50% of track)
      const fromY = fromTrackRect.top - containerRect.top + fromTrackRect.height / 2
      const toY = toTrackRect.top - containerRect.top + toTrackRect.height / 2

      const vertDist = Math.abs(toY - fromY)
      const curve = Math.min(20, vertDist * 0.2 + 8)
      const midY = (fromY + toY) / 2
      const ctrlX = Math.max(fromX, toX) + curve
      // Path in track-only coordinates so SVG can sit over track area only (label column stays clickable)
      const x0 = fromX - LABEL_COLUMN_WIDTH
      const x1 = toX - LABEL_COLUMN_WIDTH
      const cx = ctrlX - LABEL_COLUMN_WIDTH
      const d =
        vertDist < 4
          ? `M ${x0} ${fromY} L ${x1} ${toY}`
          : `M ${x0} ${fromY} Q ${cx} ${midY} ${x1} ${toY}`

      const isInbound = allInboundEdges.some(
        (e) => e.from === edge.from && e.to === edge.to
      )
      const fromShort =
        workflowMilestones.find((m) => m.key === fromMilestoneKey)?.short ?? fromMilestoneKey
      const toShort =
        workflowMilestones.find((m) => m.key === toMilestoneKey)?.short ?? toMilestoneKey
      const datePart = fromDateStr ? ` — ${formatDateDisplay(fromDateStr)}` : ''
      const tooltip = isInbound
        ? `Blocked by: ${edge.from} (${fromShort} → ${toShort})${datePart}`
        : `Blocks: ${edge.to} (${fromShort} → ${toShort})${datePart}`
      let color = '#16a34a'
      let markerEnd = 'url(#dependency-arrows-marker-green)'
      if (fromDate && fromDate.getTime() <= today.getTime()) {
        color = '#16a34a'
        markerEnd = 'url(#dependency-arrows-marker-green)'
      } else if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
        color = '#dc2626'
        markerEnd = 'url(#dependency-arrows-marker-red)'
      } else if (fromDate && toDate) {
        const diffDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && diffDays <= 10) {
          color = '#ea580c'
          markerEnd = 'url(#dependency-arrows-marker-orange)'
        }
      }
      if (showRiskOnlyRed && color !== '#dc2626') return
      newPaths.push({ d, type: isInbound ? 'inbound' : 'outbound', tooltip, color, markerEnd })
    })

    setPaths(newPaths)
  }, [
    containerRef,
    projects,
    activeProjectName,
    showRiskOnlyRed,
    visibleMonths,
    workflowMilestones,
    visibleProjectNames,
  ])

  if ((!activeProjectName && !showRiskOnlyRed) || paths.length === 0) return null

  const strokeWidthDefault = 2
  const strokeWidthHover = 3.5

  return (
    <svg
      id="dependency-arrows-svg"
      style={{
        position: 'absolute',
        left: LABEL_COLUMN_WIDTH,
        top: 0,
        width: `calc(100% - ${LABEL_COLUMN_WIDTH}px)`,
        height: '100%',
        zIndex: 20,
        pointerEvents: 'auto',
      }}
    >
      <defs>
        <marker
          id="dependency-arrows-marker-green"
          markerWidth="12"
          markerHeight="8.4"
          refX="10.8"
          refY="4.2"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points="0 0, 12 4.2, 0 8.4"
            fill="#16a34a"
            stroke="#16a34a"
            strokeWidth="1.2"
          />
        </marker>
        <marker
          id="dependency-arrows-marker-orange"
          markerWidth="12"
          markerHeight="8.4"
          refX="10.8"
          refY="4.2"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points="0 0, 12 4.2, 0 8.4"
            fill="#ea580c"
            stroke="#ea580c"
            strokeWidth="1.2"
          />
        </marker>
        <marker
          id="dependency-arrows-marker-red"
          markerWidth="12"
          markerHeight="8.4"
          refX="10.8"
          refY="4.2"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points="0 0, 12 4.2, 0 8.4"
            fill="#dc2626"
            stroke="#dc2626"
            strokeWidth="1.2"
          />
        </marker>
      </defs>
      {/* Invisible wide stroke for hover + tooltip; only this layer receives events */}
      <g style={{ pointerEvents: 'auto' }}>
        {paths.map((path, i) => (
          <path
            key={`hit-${i}`}
            d={path.d}
            stroke="transparent"
            strokeWidth="16"
            fill="none"
            style={{ pointerEvents: 'stroke', cursor: 'default' }}
            onMouseEnter={() => setHoveredPathIndex(i)}
            onMouseLeave={() => setHoveredPathIndex(null)}
          >
            <title>{path.tooltip}</title>
          </path>
        ))}
      </g>
      {/* Visible arrows; no pointer events so hit area and timeline get events */}
      <g style={{ pointerEvents: 'none' }}>
        {paths.map((path, i) => {
          const thick = hoveredPathIndex === i
          return (
            <path
              key={i}
              d={path.d}
              className={`dependency-arrow-${path.type}`}
              stroke={path.color}
              style={{ stroke: path.color }}
              strokeWidth={thick ? strokeWidthHover : strokeWidthDefault}
              fill="none"
              markerEnd={path.markerEnd}
              opacity="0.95"
            >
              <title>{path.tooltip}</title>
            </path>
          )
        })}
      </g>
    </svg>
  )
}
