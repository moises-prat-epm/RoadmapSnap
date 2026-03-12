/**
 * Dependency graph from a given project (same behavior as Lite getDependencyGraph).
 * Used for "show dependency graph" toggle: traverse inbound and outbound recursively.
 * Edges include optional milestone keys so arrows can go from/to specific milestones.
 */

import type { Project } from '../api/client'

function getDepTaskName(d: string | { task: string }): string {
  return typeof d === 'string' ? d : d.task
}

function getDepFrom(d: string | { task: string; from?: string }): string | undefined {
  return typeof d === 'object' && d && 'from' in d ? d.from : undefined
}

function getDepTo(d: string | { task: string; to?: string }): string | undefined {
  return typeof d === 'object' && d && 'to' in d ? d.to : undefined
}

export interface DependencyGraphEdge {
  from: string
  to: string
  /** Milestone key on the "from" project (origin of arrow). */
  fromMilestone?: string
  /** Milestone key on the "to" project (target of arrow). */
  toMilestone?: string
}

export interface DependencyGraph {
  nodes: Set<string>
  inboundEdges: DependencyGraphEdge[]
  outboundEdges: DependencyGraphEdge[]
}

/** Full dependency graph from sourceName: all connected nodes and edges (inbound + outbound, recursive). */
export function getDependencyGraph(sourceName: string, projects: Project[]): DependencyGraph {
  const nameToProject = new Map(projects.map((p) => [p.name, p]))
  const nodes = new Set<string>([sourceName])
  const inboundEdges: DependencyGraphEdge[] = []
  const outboundEdges: DependencyGraphEdge[] = []

  const source = nameToProject.get(sourceName)
  if (!source) return { nodes, inboundEdges, outboundEdges }

  const visitedInbound = new Set<string>()
  function traverseInbound(currentName: string) {
    if (visitedInbound.has(currentName)) return
    visitedInbound.add(currentName)
    const current = nameToProject.get(currentName)
    if (!current) return
    const deps = current.dependencies ?? []
    deps.forEach((dep) => {
      const fromName = getDepTaskName(dep)
      nodes.add(fromName)
      inboundEdges.push({
        from: fromName,
        to: currentName,
        fromMilestone: getDepFrom(dep),
        toMilestone: getDepTo(dep),
      })
      traverseInbound(fromName)
    })
  }
  traverseInbound(sourceName)

  const visitedOutbound = new Set<string>()
  function traverseOutbound(currentName: string) {
    if (visitedOutbound.has(currentName)) return
    visitedOutbound.add(currentName)
    const current = nameToProject.get(currentName)
    if (!current) return
    projects.forEach((p) => {
      if (p.id === current.id) return
      const deps = p.dependencies ?? []
      deps.forEach((dep) => {
        if (getDepTaskName(dep) !== current.name) return
        const toName = p.name
        nodes.add(toName)
        outboundEdges.push({
          from: currentName,
          to: toName,
          fromMilestone: getDepFrom(dep),
          toMilestone: getDepTo(dep),
        })
        traverseOutbound(toName)
      })
    })
  }
  traverseOutbound(sourceName)

  return { nodes, inboundEdges, outboundEdges }
}
