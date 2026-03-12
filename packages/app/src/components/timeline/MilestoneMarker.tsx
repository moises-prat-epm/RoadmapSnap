import type { MilestoneMarker as MilestoneMarkerType } from '../../lib/timeline'
import { formatDateDisplay } from '../../lib/timeline'

interface MilestoneMarkerProps {
  marker: MilestoneMarkerType
}

export default function MilestoneMarkerComponent({ marker }: MilestoneMarkerProps) {
  return (
    <div
      className={`milestone-marker ${marker.slotClass} ${marker.hideLabel ? 'dot-only' : ''}`}
      style={{ left: `${marker.position}%` }}
      title={`${marker.short}: ${formatDateDisplay(marker.date)}`}
    >
      {!marker.hideLabel && marker.short}
      {!marker.hideLabel && (
        <span className="milestone-date">{formatDateDisplay(marker.date)}</span>
      )}
    </div>
  )
}
