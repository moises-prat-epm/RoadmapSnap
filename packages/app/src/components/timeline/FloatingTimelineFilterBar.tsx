import { useState, useEffect, useCallback, useRef } from 'react'
import type { WorkflowItem } from '../../api/client'
import type { WorkspaceProjectFilter } from '../../lib/projectFilters'
import {
  getLastMilestoneKeyForWorkflow,
  type TimelineSortState,
  type TimelineSortBy,
  type TimelineSortOrder,
} from '../../lib/timelineSort'
import type { ZoomPreset } from './TimelineToolbar'

const riskIconSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z" />
  </svg>
)

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}

/** Button labels match Lite filter bar (3mo / 6mo / 12mo). */
const ZOOM_LABELS: Record<ZoomPreset, string> = {
  '3m': '3mo',
  '6m': '6mo',
  '12m': '12mo',
  all: 'All',
}

export interface FloatingTimelineFilterBarProps {
  /** Projects tab: same fixed bar styling; status filter; no sort/zoom/groups. */
  variant?: 'timeline' | 'projects'
  workflow: WorkflowItem[]
  filter: WorkspaceProjectFilter
  onFilterChange: (partial: Partial<WorkspaceProjectFilter>) => void
  timelineSort: TimelineSortState
  onTimelineSortChange: (partial: Partial<TimelineSortState>) => void
  totalCount: number
  filteredCount: number
  zoom: ZoomPreset
  onZoomChange: (z: ZoomPreset) => void
  showGroupControls: boolean
  onExpandAll: () => void
  onCollapseAll: () => void
  /** Show At Risk toggle only when timeline has risk-signaled items (matches Lite-style gating). */
  showAtRiskFilter: boolean
  /** Shown in the At Risk control as "N At Risk" (Lite dashboard). */
  atRiskCount: number
  /** Show Descoped toggle only when timeline has descoped items. */
  showDescopedFilter: boolean
}

function stateItems(workflow: WorkflowItem[]): WorkflowItem[] {
  return workflow.filter((w) => w.type === 'state')
}

/**
 * Same control order / grouping as Lite `renderFilterBar` (search → clear → groups → zoom → …),
 * plus SaaS-only At Risk and Descoped. Exports live above the dashboard like Lite `renderExportControls`.
 */
export default function FloatingTimelineFilterBar({
  variant = 'timeline',
  workflow,
  filter,
  onFilterChange,
  timelineSort,
  onTimelineSortChange,
  totalCount,
  filteredCount,
  zoom,
  onZoomChange,
  showGroupControls,
  onExpandAll,
  onCollapseAll,
  showAtRiskFilter,
  atRiskCount,
  showDescopedFilter,
}: FloatingTimelineFilterBarProps) {
  const isProjects = variant === 'projects'
  const states = stateItems(workflow)
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

  const hasActiveFilters = isProjects
    ? !!filter.search.trim() ||
      filter.statusFilter !== 'ALL' ||
      filter.riskOnly ||
      filter.descopedOnly
    : !!filter.search.trim() || filter.riskOnly || filter.descopedOnly

  const clear = useCallback(() => {
    setSearchText('')
    onFilterChangeRef.current(
      isProjects
        ? {
            search: '',
            statusFilter: 'ALL',
            riskOnly: false,
            descopedOnly: false,
          }
        : {
            search: '',
            riskOnly: false,
            descopedOnly: false,
          }
    )
  }, [isProjects])

  return (
    <div
      className="filter-bar filter-bar--timeline-sticky"
      role="toolbar"
      aria-label={isProjects ? 'Project filters' : 'Timeline filters'}
    >
      <div className="filter-group">
        <input
          type="text"
          className="filter-input"
          placeholder={isProjects ? 'Search by name or tag…' : 'Search by name...'}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {isProjects && workflow.length > 0 && (
        <div className="filter-group">
          <span className="filter-label">Status</span>
          <select
            className="filter-select"
            value={filter.statusFilter}
            onChange={(e) => onFilterChange({ statusFilter: e.target.value })}
          >
            <option value="ALL">All Statuses</option>
            {states.map((s) => (
              <option key={s.key} value={s.key}>
                {s.short} — {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isProjects && workflow.length > 0 && (
        <div className="filter-group">
          <span className="filter-label">Sort:</span>
          <select
            className="filter-select"
            aria-label="Sort by"
            value={timelineSort.by}
            onChange={(e) => onTimelineSortChange({ by: e.target.value as TimelineSortBy })}
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="m3date">{getLastMilestoneKeyForWorkflow(workflow)} Date</option>
            <option value="risk">Risk</option>
          </select>
          <select
            className="filter-select"
            aria-label="Sort order"
            value={timelineSort.order}
            onChange={(e) => onTimelineSortChange({ order: e.target.value as TimelineSortOrder })}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      )}

      <button
        type="button"
        className="filter-clear"
        onClick={clear}
        disabled={!hasActiveFilters}
        title={
          hasActiveFilters
            ? isProjects
              ? 'Clear search, status, and risk/descoped filters'
              : 'Clear search and risk/descoped filters'
            : 'No filters to clear'
        }
      >
        Clear Filters
      </button>

      {!isProjects && showGroupControls && (
        <div className="group-controls">
          <button type="button" className="group-control-btn" onClick={onExpandAll}>
            Expand All
          </button>
          <button type="button" className="group-control-btn" onClick={onCollapseAll}>
            Collapse All
          </button>
        </div>
      )}

      {!isProjects && (
        <div className="zoom-controls">
          <span className="filter-label">Zoom:</span>
          {(['3m', '6m', '12m', 'all'] as const).map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => onZoomChange(z)}
              className={`zoom-btn ${zoom === z ? 'active' : ''}`}
            >
              {ZOOM_LABELS[z]}
            </button>
          ))}
        </div>
      )}

      {showAtRiskFilter && (
        <div className="filter-group">
          <button
            type="button"
            className={`risk-summary clickable ${filter.riskOnly ? 'active' : ''}`}
            title="Show only at-risk items"
            onClick={() => onFilterChange({ riskOnly: !filter.riskOnly, descopedOnly: false })}
          >
            <span className="risk-summary-icon">{riskIconSvg}</span>
            <span className="risk-summary-text">
              {atRiskCount} At Risk
            </span>
          </button>
        </div>
      )}

      {showDescopedFilter && (
        <div className="filter-group">
          <button
            type="button"
            className={`filter-toggle ${filter.descopedOnly ? 'active' : ''}`}
            onClick={() => onFilterChange({ descopedOnly: !filter.descopedOnly, riskOnly: false })}
          >
            Descoped
          </button>
        </div>
      )}

      <div className="filter-results">
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> projects
      </div>
    </div>
  )
}
