import type { GanttSegment } from '../../lib/timeline'

interface GanttBarProps {
  segments: GanttSegment[]
  /** Tooltip shown when hovering over the bar (milestone dates) */
  title?: string
}

export default function GanttBar({ segments, title }: GanttBarProps) {
  return (
    <>
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`gantt-bar ${seg.segmentClass} ${seg.isFuture ? 'gantt-future' : ''}`}
          style={{
            left: `${seg.startPct}%`,
            width: `${seg.widthPct}%`,
          }}
          title={title}
        />
      ))}
    </>
  )
}
