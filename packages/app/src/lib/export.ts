import html2canvas from 'html2canvas'
import type { Project, Workspace, WorkflowItem } from '../api/client'
import { getCurrentStatus } from './stats'
import { getTodayStr } from './stats'

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToPNG(element: HTMLElement | null, fileNamePrefix: string): Promise<void> {
  if (!element) return Promise.resolve()
  return html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  }).then((canvas) => {
    const link = document.createElement('a')
    const today = getTodayStr().replace(/\//g, '-')
    link.download = `${fileNamePrefix}-${today}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}

function getStates(workflow: WorkflowItem[]) {
  return workflow.filter((w) => w.type === 'state')
}

function getMilestones(workflow: WorkflowItem[]) {
  return workflow.filter((w) => w.type === 'milestone')
}

function getMilestoneDate(project: Project, key: string): string | null {
  return project.milestones?.[key] ?? null
}

export function exportToCSV(
  projects: Project[],
  workflow: WorkflowItem[],
  todayStr: string
): void {
  const milestones = getMilestones(workflow)
  const headers = ['Name', 'Group', 'Current State', 'At Risk', 'Descoped', 'Tags', 'Link']
  milestones.forEach((m) => headers.push(`${m.key} Date`))
  const rows = [headers.join(',')]

  const projectLike = (p: Project) => ({
    name: p.name,
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
    descoped: p.descoped,
  })

  projects.forEach((p) => {
    const status = getCurrentStatus(projectLike(p), workflow, todayStr)
    const stateItem = workflow.find((w) => w.type === 'state' && w.key === status)
    const stateLabel = stateItem ? `${stateItem.short} - ${stateItem.title}` : status
    const row = [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.group_name || ''}"`,
      stateLabel,
      p.at_risk ? 'Yes' : 'No',
      p.descoped ? 'Yes' : 'No',
      `"${(p.tags || []).join('; ')}"`,
      `"${p.external_link || ''}"`,
    ]
    milestones.forEach((m) => {
      row.push(getMilestoneDate(p, m.key) || '')
    })
    rows.push(row.join(','))
  })

  const csvContent = rows.join('\n')
  downloadBlob(csvContent, 'roadmap-projects.csv', 'text/csv')
}

export function exportToJSON(
  projects: Project[],
  workspace: Workspace | null,
  workflow: WorkflowItem[],
  todayStr: string
): void {
  const projectLike = (p: Project) => ({
    name: p.name,
    milestones: p.milestones ?? {},
    at_risk: p.at_risk,
    show_in_timeline: p.show_in_timeline,
    descoped: p.descoped,
  })

  const exportData = {
    exportDate: new Date().toISOString(),
    workspace: workspace
      ? {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          workflow_definition: workspace.workflow_definition,
        }
      : null,
    workflow,
    states: getStates(workflow),
    milestones: getMilestones(workflow),
    projects: projects.map((p) => {
      const status = getCurrentStatus(projectLike(p), workflow, todayStr)
      const stateItem = workflow.find((w) => w.type === 'state' && w.key === status)
      return {
        ...p,
        currentState: stateItem ? { key: stateItem.key, title: stateItem.title } : null,
      }
    }),
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadBlob(jsonContent, 'roadmap-projects.json', 'application/json')
}
