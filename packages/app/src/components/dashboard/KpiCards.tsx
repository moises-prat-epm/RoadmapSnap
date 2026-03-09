import type { StatsResult, WorkflowItem } from '../../lib/stats'
import ProgressBar from './ProgressBar'

interface KpiCardsProps {
  stats: StatsResult
  workflow: WorkflowItem[]
  onFilterByStatus?: (key: string) => void
}

function getStateByKey(workflow: WorkflowItem[], key: string): WorkflowItem | undefined {
  return workflow.find((item) => item.type === 'state' && item.key === key)
}

export default function KpiCards({ stats, workflow, onFilterByStatus }: KpiCardsProps) {
  const stateKeys = stats.stateKeys
  const lastKey = stateKeys[stateKeys.length - 1]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stateKeys.map((key) => {
          const state = getStateByKey(workflow, key)
          const count = stats.visibleByStatus[key] ?? 0
          const pct = stats.total === 0 ? 0 : Math.round((count / stats.total) * 100)
          const isLast = key === lastKey

          let cardClass =
            'rounded-lg border p-4 transition-colors ' +
            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 '
          if (isLast) {
            cardClass += 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20'
          } else {
            cardClass += 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterByStatus?.(key)}
              className={`${cardClass} text-left w-full`}
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {state?.title ?? key}
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {pct}% of total
              </div>
            </button>
          )
        })}

        {/* At-risk card */}
        <div className="rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20 p-4">
          <div className="text-sm font-medium text-amber-800 dark:text-amber-200">At risk</div>
          <div className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">
            {stats.atRisk}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">
            {stats.total === 0 ? 0 : Math.round((stats.atRisk / stats.total) * 100)}% of total
          </div>
        </div>
      </div>

      <ProgressBar
        completionPercentage={stats.completionPercentage}
        total={stats.total}
        label="Completion"
      />
    </div>
  )
}
