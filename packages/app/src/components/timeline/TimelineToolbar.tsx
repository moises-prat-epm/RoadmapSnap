import { useState, useEffect, useCallback, useRef } from 'react'
import type { WorkflowItem } from '../../api/client'
import type { WorkspaceProjectFilter } from '../../lib/projectFilters'

export type ZoomPreset = '3m' | '6m' | '12m' | 'all'

const riskIconSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z" />
  </svg>
)

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

export interface TimelineToolbarProps {
  workflow: WorkflowItem[]
  filter: WorkspaceProjectFilter
  /** Merged into existing filter by parent (spread). */
  onFilterChange: (partial: Partial<WorkspaceProjectFilter>) => void
  totalCount: number
  filteredCount: number
  /** When false, only search / status / risk / descoped / summary / clear (for Projects tab). */
  showTimelineControls?: boolean
  /** When true, hide the Status dropdown (status is controlled elsewhere, e.g. KPI cards). */
  hideStatusFilter?: boolean
  /** When true, hide the At Risk toggle (timeline uses KPI header; Projects tab keeps toolbar control). */
  hideRiskFilter?: boolean
  /** When true, hide Descoped (shown next to At Risk in KPI header on timeline). */
  hideDescopedFilter?: boolean
  /** When true, hide PNG/CSV/JSON exports (shown in KPI header on timeline). */
  hideExportControls?: boolean
  zoom?: ZoomPreset
  onZoomChange?: (z: ZoomPreset) => void
  showGroupControls?: boolean
  onExpandAll?: () => void
  onCollapseAll?: () => void
  onExportPNG?: () => void
  onExportCSV?: () => void
  onExportJSON?: () => void
}

/**
 * Single toolbar (Lite-style): search, status, optional At Risk, Descoped, counts, clear,
 * then zoom / groups / exports when `showTimelineControls` is true.
 */
export default function TimelineToolbar({
  workflow,
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
  showTimelineControls = true,
  hideStatusFilter = false,
  hideRiskFilter = false,
  hideDescopedFilter = false,
  hideExportControls = false,
  zoom = 'all',
  onZoomChange,
  showGroupControls = false,
  onExpandAll,
  onCollapseAll,
  onExportPNG,
  onExportCSV,
  onExportJSON,
}: TimelineToolbarProps) {
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
    !!filter.search.trim() ||
    filter.statusFilter !== 'ALL' ||
    filter.riskOnly ||
    filter.descopedOnly

  const clear = useCallback(() => {
    setSearchText('')
    onFilterChangeRef.current({
      search: '',
      statusFilter: 'ALL',
      riskOnly: false,
      descopedOnly: false,
    })
  }, [])

  return (
    <div className="filter-bar">
      {showTimelineControls && onZoomChange && (
        <div className="filter-group zoom-controls">
          <span className="filter-label">Zoom:</span>
          {(['3m', '6m', '12m', 'all'] as const).map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => onZoomChange(z)}
              className={`zoom-btn ${zoom === z ? 'active' : ''}`}
            >
              {z === 'all' ? 'All' : z.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="filter-group">
        <input
          type="search"
          className="filter-input"
          placeholder="Search by name or tag…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {!hideStatusFilter && (
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

      {!hideRiskFilter && (
        <div className="filter-group">
          <button
            type="button"
            className={`risk-summary clickable ${filter.riskOnly ? 'active' : ''}`}
            title="Show only at-risk items"
            onClick={() => onFilterChange({ riskOnly: !filter.riskOnly, descopedOnly: false })}
          >
            <span className="risk-summary-icon">{riskIconSvg}</span>
            <span className="risk-summary-text">At Risk</span>
          </button>
        </div>
      )}

      {!hideDescopedFilter && (
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

      <span className="filter-summary text-xs tabular-nums text-text-light">
        Showing {filteredCount} of {totalCount} projects
      </span>

      {hasActiveFilters && (
        <button type="button" className="filter-clear" onClick={clear}>
          Clear filters
        </button>
      )}

      {showTimelineControls && showGroupControls && onExpandAll && onCollapseAll && (
        <div className="group-controls">
          <button type="button" className="group-control-btn" onClick={onExpandAll}>
            Expand All
          </button>
          <button type="button" className="group-control-btn" onClick={onCollapseAll}>
            Collapse All
          </button>
        </div>
      )}

      {showTimelineControls && !hideExportControls && onExportPNG && onExportCSV && onExportJSON && (
        <div className="export-controls">
          <button type="button" className="export-btn" onClick={onExportPNG}>
            Export PNG
          </button>
          <button type="button" className="export-btn export-btn--secondary" onClick={onExportCSV}>
            CSV
          </button>
          <button type="button" className="export-btn export-btn--secondary" onClick={onExportJSON}>
            JSON
          </button>
        </div>
      )}
    </div>
  )
}
