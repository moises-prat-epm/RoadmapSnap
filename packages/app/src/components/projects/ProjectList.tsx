import { useMemo, useState } from 'react'
import type { Project, Workspace, WorkflowItem } from '../../api/client'
import { getCurrentStatus, getTodayStr, parseDate } from '../../lib/stats'
import {
  applyProjectFilters,
  getMilestoneDateStrForProject,
  getWorkflowMilestones,
  projectToProjectLike,
  type WorkspaceProjectFilter,
} from '../../lib/projectFilters'

export interface ProjectListProps {
  projects: Project[]
  workspace: Workspace
  filter: WorkspaceProjectFilter
  onClearFilters?: () => void
}

type SortColumn = 'name' | 'group' | 'status' | 'milestone'

function formatShortEnglishDate(ddMmYyyy: string): string {
  const d = parseDate(ddMmYyyy)
  if (!d) return ddMmYyyy
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStateKeys(workflow: WorkflowItem[]): string[] {
  return workflow.filter((w) => w.type === 'state').map((w) => w.key)
}

type NextMilestoneCell =
  | { kind: 'next'; short: string; dateStr: string }
  | { kind: 'complete' }
  | { kind: 'empty' }

function getNextMilestoneCell(project: Project, workflow: WorkflowItem[], todayStr: string): NextMilestoneCell {
  const milestones = getWorkflowMilestones(workflow)
  const today = parseDate(todayStr)
  if (!today || milestones.length === 0) return { kind: 'empty' }

  for (const m of milestones) {
    const ds = getMilestoneDateStrForProject(project, m.key, workflow)
    const d = parseDate(ds)
    if (d && d > today) {
      return { kind: 'next', short: m.short, dateStr: ds! }
    }
  }

  const lastM = milestones[milestones.length - 1]
  const lastDs = getMilestoneDateStrForProject(project, lastM.key, workflow)
  const lastD = parseDate(lastDs)
  if (lastD && today >= lastD) return { kind: 'complete' }

  const anyDate = milestones.some((m) => getMilestoneDateStrForProject(project, m.key, workflow))
  if (!anyDate) return { kind: 'empty' }
  return { kind: 'empty' }
}

function milestoneSortValue(project: Project, workflow: WorkflowItem[], todayStr: string): number {
  const cell = getNextMilestoneCell(project, workflow, todayStr)
  if (cell.kind === 'next') return parseDate(cell.dateStr)!.getTime()
  if (cell.kind === 'complete') return Number.MAX_SAFE_INTEGER - 1
  return Number.MAX_SAFE_INTEGER
}

const externalLinkIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export default function ProjectList({ projects, workspace, filter, onClearFilters }: ProjectListProps) {
  const workflow = workspace.workflow_definition ?? []
  const todayStr = getTodayStr()
  const stateKeys = useMemo(() => getStateKeys(workflow), [workflow])

  const filtered = useMemo(
    () => applyProjectFilters(projects, workflow, filter, todayStr, 'list'),
    [projects, workflow, filter, todayStr]
  )

  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(col)
      setSortDir(col === 'milestone' ? 'asc' : 'asc')
    }
  }

  const sorted = useMemo(() => {
    const list = [...filtered]
    const cmp = (a: Project, b: Project): number => {
      let va: string | number
      let vb: string | number
      switch (sortColumn) {
        case 'name':
          va = a.name.toLowerCase()
          vb = b.name.toLowerCase()
          break
        case 'group':
          va = (a.group_name ?? '').toLowerCase()
          vb = (b.group_name ?? '').toLowerCase()
          break
        case 'status': {
          const sa = getCurrentStatus(projectToProjectLike(a), workflow, todayStr)
          const sb = getCurrentStatus(projectToProjectLike(b), workflow, todayStr)
          va = stateKeys.indexOf(sa)
          vb = stateKeys.indexOf(sb)
          if (va < 0) va = 999
          if (vb < 0) vb = 999
          break
        }
        case 'milestone':
          va = milestoneSortValue(a, workflow, todayStr)
          vb = milestoneSortValue(b, workflow, todayStr)
          break
        default:
          return 0
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return a.name.localeCompare(b.name)
    }
    list.sort(cmp)
    return list
  }, [filtered, sortColumn, sortDir, workflow, todayStr, stateKeys])

  const headerBtn = (col: SortColumn, label: string) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-0.5 font-semibold text-text-dark hover:text-m3"
    >
      {label}
      {sortColumn === col && <span aria-hidden>{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>}
    </button>
  )

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-secondary px-6 py-10 text-center">
        <p className="text-sm text-text-light">No projects match your filters</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 text-sm font-medium text-m3 underline hover:opacity-80"
          >
            Clear filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-bg-white">
      <table className="min-w-full divide-y divide-border text-left text-sm text-text-dark">
        <thead className="bg-secondary">
          <tr>
            <th scope="col" className="px-3 py-2">
              {headerBtn('name', 'Name')}
            </th>
            <th scope="col" className="px-3 py-2">
              {headerBtn('group', 'Group')}
            </th>
            <th scope="col" className="px-3 py-2">
              {headerBtn('status', 'Status')}
            </th>
            <th scope="col" className="px-3 py-2 text-text-light">
              At Risk
            </th>
            <th scope="col" className="px-3 py-2">
              {headerBtn('milestone', 'Next Milestone')}
            </th>
            <th scope="col" className="px-3 py-2">
              Tags
            </th>
            <th scope="col" className="w-12 px-3 py-2 text-center text-text-light">
              Link
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-bg-white">
          {sorted.map((project) => {
            const statusKey = getCurrentStatus(projectToProjectLike(project), workflow, todayStr)
            const stateIndex = stateKeys.indexOf(statusKey)
            const stateIdxClamp = stateIndex >= 0 ? Math.min(stateIndex, 7) : 0
            const stateClass = `state-${stateIdxClamp}`
            const stateItem = workflow.find((w) => w.type === 'state' && w.key === statusKey)
            const nextCell = getNextMilestoneCell(project, workflow, todayStr)
            const tags = project.tags ?? []
            const visibleTags = tags.slice(0, 3)
            const overflow = tags.length - visibleTags.length

            return (
              <tr key={project.id} className="hover:bg-secondary">
                <td className="px-3 py-2 align-top">
                  <div
                    className={`font-semibold ${project.descoped ? 'text-text-light line-through' : 'text-text-dark'}`}
                  >
                    {project.name}
                  </div>
                  {project.show_in_timeline === false && (
                    <div className="text-xs italic text-text-light">(hidden from timeline)</div>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-text-dark">
                  {project.group_name ?? '—'}
                </td>
                <td className="px-3 py-2 align-top">
                  <span className={`state-legend-badge inline-block rounded px-2 py-0.5 text-xs font-medium ${stateClass}`}>
                    {stateItem?.short ?? statusKey}
                  </span>
                </td>
                <td className="px-3 py-2 align-top">
                  {project.at_risk ? (
                    <span className="inline-flex items-center gap-1 text-xs text-risk">
                      <span className="h-2 w-2 rounded-full bg-risk" aria-hidden />
                      At risk
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 align-top text-text-dark">
                  {nextCell.kind === 'next' && (
                    <span>
                      {nextCell.short}{' '}
                      <span className="text-text-light">{formatShortEnglishDate(nextCell.dateStr)}</span>
                    </span>
                  )}
                  {nextCell.kind === 'complete' && (
                    <span className="inline-block rounded border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-m2">
                      Complete
                    </span>
                  )}
                  {nextCell.kind === 'empty' && <span className="text-text-light">—</span>}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex flex-wrap gap-1">
                    {visibleTags.map((t) => (
                      <span
                        key={t}
                        className="inline-block max-w-[120px] truncate rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-text-dark"
                      >
                        {t}
                      </span>
                    ))}
                    {overflow > 0 && <span className="text-xs text-text-light">+{overflow} more</span>}
                  </div>
                </td>
                <td className="px-3 py-2 text-center align-top">
                  {project.external_link ? (
                    <a
                      href={project.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-m3 hover:opacity-80"
                      title="Open external link"
                    >
                      {externalLinkIcon}
                    </a>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
