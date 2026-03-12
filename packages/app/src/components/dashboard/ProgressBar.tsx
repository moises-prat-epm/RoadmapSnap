interface ProgressBarProps {
  completionPercentage: number
  total: number
  label: string
}

export default function ProgressBar({ completionPercentage, total, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, completionPercentage))
  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-title">{label}</span>
        <span className="progress-percentage">
          {pct}%{total >= 0 ? ` (${total} items)` : ''}
        </span>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-segment state-4"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
