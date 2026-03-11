import type { MilestoneMarker } from '../../lib/timeline'
import { formatDateDisplay } from '../../lib/timeline'

interface MilestoneMarkerProps {
  marker: MilestoneMarker
}

export default function MilestoneMarkerComponent({ marker }: MilestoneMarkerProps) {
  const isStart = marker.slotClass === 'start'
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center ${
        isStart ? 'milestone-start' : 'milestone-diamond'
      }`}
      style={{ left: `${marker.position}%` }}
    >
      {isStart ? (
        <div
          className="w-3 h-3 rounded-full border-2 border-slate-700 dark:border-slate-300 bg-white dark:bg-slate-800"
          title={`${marker.short}: ${formatDateDisplay(marker.date)}`}
        />
      ) : (
        <div
          className="w-2.5 h-2.5 rotate-45 bg-blue-600 dark:bg-blue-400 border border-blue-700 dark:border-blue-300"
          style={{ transform: 'translateY(-50%) rotate(45deg)' }}
          title={`${marker.short}: ${formatDateDisplay(marker.date)}`}
        />
      )}
      {!marker.hideLabel && (
        <div className="absolute top-full mt-0.5 flex flex-col items-center whitespace-nowrap">
          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
            {marker.short}
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400">
            {formatDateDisplay(marker.date)}
          </span>
        </div>
      )}
    </div>
  )
}
