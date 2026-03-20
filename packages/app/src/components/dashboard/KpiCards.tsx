import type { StatsResult, WorkflowItem } from '../../lib/stats'
import { getTodayStr } from '../../lib/stats'

interface KpiCardsProps {
  stats: StatsResult
  workflow: WorkflowItem[]
  onFilterByStatus?: (key: string) => void
  activeStatusFilter?: string
}

function formatShortDate(ddMmYyyy: string): string {
  const parts = ddMmYyyy.trim().split('/').map(Number)
  if (parts.length !== 3) return ddMmYyyy
  const [day, month, year] = parts
  const d = new Date(year, month - 1, day)
  if (isNaN(d.getTime())) return ddMmYyyy
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStateByKey(workflow: WorkflowItem[], key: string): WorkflowItem | undefined {
  return workflow.find((item) => item.type === 'state' && item.key === key)
}

export default function KpiCards({
  stats,
  workflow,
  onFilterByStatus,
  activeStatusFilter = 'ALL',
}: KpiCardsProps) {
  const stateKeys = stats.stateKeys
  const total = stats.total
  const todayStr = getTodayStr()

  return (
    <div className="summary-dashboard">
      <div className="summary-header summary-header--tab-context">
        <div className="header-right">
          <div className="today-date-container">
            <span className="today-date-label">Today:</span>
            <span className="today-date-value">{formatShortDate(todayStr)}</span>
          </div>
        </div>
      </div>

      <div
        className="kpi-section"
        style={{ gridTemplateColumns: `repeat(${1 + stateKeys.length}, 1fr)` }}
      >
        <div className="kpi-card total">
          <div className="kpi-value">{total}</div>
          <div className="kpi-label">Total Items</div>
          <div className="kpi-sublabel">in scope</div>
        </div>
        {stateKeys.map((key, stateIndex) => {
          const state = getStateByKey(workflow, key)
          const count = stats.visibleByStatus[key] ?? 0
          const active = activeStatusFilter === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterByStatus?.(key)}
              className={`kpi-card state-${Math.min(stateIndex, 7)} clickable ${active ? 'active' : ''}`}
            >
              <div className="kpi-value">{count}</div>
              <div className="kpi-label">{state?.title ?? key}</div>
              <div className="kpi-sublabel">{state?.description ?? ''}</div>
            </button>
          )
        })}
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-title" aria-hidden="true" />
          <span className="progress-percentage">
            {stats.completionPercentage}%{total >= 0 ? ` (${total} items)` : ''}
          </span>
        </div>
        <div className="progress-bar-container">
          {stateKeys.map((key, i) => {
            const count = stats.visibleByStatus[key] ?? 0
            const pct = total > 0 ? (count / total) * 100 : 0
            const isFiltering = activeStatusFilter && activeStatusFilter !== 'ALL'
            const isActiveFilter = activeStatusFilter === key
            const opacity = isFiltering ? (isActiveFilter ? 1 : 0.3) : 1
            const stateClass = `state-${Math.min(i, 7)}`
            return (
              <div
                key={key}
                className={`progress-segment ${stateClass}`}
                style={{ width: `${pct}%`, opacity }}
                title={`${key}: ${count}`}
              >
                {count > 0 ? count : ''}
              </div>
            )
          })}
        </div>
        <div className="progress-legend">
          {stateKeys.map((key, i) => {
            const state = getStateByKey(workflow, key)
            const stateClass = `state-${Math.min(i, 7)}`
            return (
              <div key={key} className="progress-legend-item">
                <div className={`progress-legend-dot ${stateClass}`} />
                <span>{state?.short ?? key} {state?.title ?? key}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
