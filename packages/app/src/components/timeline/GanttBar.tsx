import type { GanttSegment } from '../../lib/timeline'

interface GanttBarProps {
  segments: GanttSegment[]
}

export default function GanttBar({ segments }: GanttBarProps) {
  return (
    <div className="absolute inset-0 flex">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`absolute top-0 h-full rounded-sm ${
            seg.className === 'gantt-past'
              ? 'bg-emerald-500 dark:bg-emerald-600'
              : 'bg-slate-200 dark:bg-slate-600'
          }`}
          style={{
            left: `${seg.startPct}%`,
            width: `${seg.widthPct}%`,
          }}
        />
      ))}
    </div>
  )
}
