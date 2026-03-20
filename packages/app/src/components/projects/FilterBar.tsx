import { useState, useEffect, useCallback, useRef } from 'react'
import type { WorkflowItem } from '../../api/client'

export type FilterState = {
  search: string
  statusFilter: string
  riskOnly: boolean
}

export interface FilterBarProps {
  workflow: WorkflowItem[]
  filter: FilterState
  onFilterChange: (filter: Partial<FilterState>) => void
  totalCount: number
  filteredCount: number
}

function stateItems(workflow: WorkflowItem[]): WorkflowItem[] {
  return workflow.filter((w) => w.type === 'state')
}

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}

export default function FilterBar({
  workflow,
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const [searchText, setSearchText] = useState(filter.search)
  const onFilterChangeRef = useRef(onFilterChange)
  onFilterChangeRef.current = onFilterChange

  useEffect(() => {
    setSearchText(filter.search)
  }, [filter.search])

  const debouncedSearch = useDebouncedValue(searchText, 200)

  useEffect(() => {
    if (debouncedSearch !== filter.search) {
      onFilterChangeRef.current({ search: debouncedSearch })
    }
  }, [debouncedSearch, filter.search])

  const states = stateItems(workflow)

  const hasActiveFilters =
    !!filter.search.trim() || filter.statusFilter !== 'ALL' || filter.riskOnly

  const clear = useCallback(() => {
    setSearchText('')
    onFilterChangeRef.current({ search: '', statusFilter: 'ALL', riskOnly: false })
  }, [])

  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800">
      <input
        type="search"
        placeholder="Search…"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="min-w-[140px] max-w-[200px] flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
        aria-label="Search projects"
      />

      <label className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
        <span className="hidden sm:inline">Status</span>
        <select
          value={filter.statusFilter}
          onChange={(e) => onFilterChange({ statusFilter: e.target.value })}
          className="rounded border border-slate-300 bg-white py-1 pl-2 pr-7 text-xs text-slate-900 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="ALL">All Statuses</option>
          {states.map((s) => (
            <option key={s.key} value={s.key}>
              {s.short} — {s.title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={filter.riskOnly}
          onChange={(e) => onFilterChange({ riskOnly: e.target.checked })}
          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-500"
        />
        At risk only
      </label>

      <span className="ml-auto text-xs tabular-nums text-slate-500 dark:text-slate-400">
        Showing {filteredCount} of {totalCount} projects
      </span>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clear}
          className="shrink-0 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
