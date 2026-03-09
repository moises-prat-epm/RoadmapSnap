interface ProgressBarProps {
  completionPercentage: number
  total: number
  label: string
}

export default function ProgressBar({ completionPercentage, total, label }: ProgressBarProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completionPercentage}%{total >= 0 ? ` (${total} items)` : ''}
        </span>
      </div>
      <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 dark:bg-blue-600 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
        />
      </div>
    </div>
  )
}
