import type { WorkflowItem } from '../../api/client'
import { getUpcomingMilestones } from '../../lib/stats'
import type { Project } from '../../api/client'

function formatShortDate(ddMmYyyy: string): string {
  const parts = ddMmYyyy.trim().split('/').map(Number)
  if (parts.length !== 3) return ddMmYyyy
  const [day, month, year] = parts
  const d = new Date(year, month - 1, day)
  if (isNaN(d.getTime())) return ddMmYyyy
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function getMilestones(workflow: WorkflowItem[]) {
  return workflow.filter((item): item is WorkflowItem & { type: 'milestone' } => item.type === 'milestone')
}

interface KeyMilestonesProps {
  projects: Project[]
  workflow: WorkflowItem[]
  todayStr: string
}

export default function KeyMilestones({ projects, workflow, todayStr }: KeyMilestonesProps) {
  const milestones = getMilestones(workflow)
  if (milestones.length === 0) return null

  const projectsForStats = projects.map((p) => ({
    name: p.name,
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
  }))
  const upcoming = getUpcomingMilestones(projectsForStats, workflow, todayStr)

  return (
    <div className="key-milestones">
      {milestones.map((m, idx) => {
        const item = upcoming[m.key]
        const slot = idx === 0 ? 'start' : 'm' + Math.min(idx - 1, 5)
        const content = item ? (
          <>
            <span className="milestone-card-date">{formatShortDate(item.date)}</span>
            {' - '}
            <span className="milestone-card-source">{item.source}</span>
            {item.atRisk ? ' ⚠️' : ''}
          </>
        ) : (
          `All ${(m.title ?? m.key).toLowerCase()} complete`
        )
        return (
          <div key={m.key} className="milestone-card">
            <div className="milestone-card-header">
              <div className={`milestone-card-icon ${slot}`}>{m.short}</div>
              <div>
                <div className="milestone-card-title">Next {m.title}</div>
                <div className="milestone-card-subtitle">{m.subtitle ?? ''}</div>
              </div>
            </div>
            <div className="milestone-card-content">{content}</div>
          </div>
        )
      })}
    </div>
  )
}
