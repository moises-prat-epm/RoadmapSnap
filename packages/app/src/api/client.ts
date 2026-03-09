/**
 * Typed API client for RoadmapSnap backend.
 */

export interface WorkspaceSummary {
  id: string
  name: string
  slug: string
}

export interface MilestoneMap {
  [key: string]: string
}

export interface Project {
  id: string
  name: string
  group_name: string | null
  at_risk: boolean
  descoped: boolean
  show_in_timeline: boolean
  tags: string[]
  external_link: string | null
  display_order: number
  milestones: MilestoneMap
}

export interface WorkflowItem {
  type: 'state' | 'milestone'
  key: string
  short: string
  title: string
  description?: string
  subtitle?: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  workflow_definition: WorkflowItem[]
  entity_labels: Record<string, string>
  dashboard_text: Record<string, string>
  settings: Record<string, unknown>
}

export interface WorkspaceWithProjects {
  workspace: Workspace
  projects: Project[]
}

export interface UserPreferences {
  theme: 'light' | 'dark'
}

export interface CurrentUser {
  sub: string
  email: string
  name: string
  preferences: UserPreferences
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export class ApiClient {
  constructor(
    private baseUrl: string = '',
    private getAccessToken: () => Promise<string>
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken()
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new ApiError(401, 'No access token available. Please sign in again.')
    }
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new ApiError(401, 'Invalid access token format. Please sign in again.')
    }
    const url = this.baseUrl + path
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      let message = res.statusText
      try {
        const data = await res.json() as { message?: string; error?: string }
        message = data.message ?? data.error ?? message
      } catch {
        // ignore
      }
      throw new ApiError(res.status, message)
    }
    return res.json() as Promise<T>
  }

  getWorkspaces(): Promise<{ workspaces: WorkspaceSummary[] }> {
    return this.request('GET', '/api/v1/workspaces')
  }

  getWorkspace(id: string): Promise<{ workspace: Workspace }> {
    return this.request('GET', `/api/v1/workspaces/${id}`)
  }

  getWorkspaceProjects(id: string): Promise<WorkspaceWithProjects> {
    return this.request('GET', `/api/v1/workspaces/${id}/projects`)
  }

  createWorkspace(body: { name: string; slug: string }): Promise<{ workspace: Workspace }> {
    return this.request('POST', '/api/v1/workspaces', body)
  }

  updateWorkspace(id: string, body: Partial<Workspace>): Promise<{ workspace: Workspace }> {
    return this.request('PATCH', `/api/v1/workspaces/${id}`, body)
  }

  getMe(): Promise<CurrentUser> {
    return this.request('GET', '/auth/me')
  }

  updateMe(body: { preferences: UserPreferences }): Promise<CurrentUser> {
    return this.request('PATCH', '/auth/me', body)
  }
}

export function createApiClient(
  getAccessToken: () => Promise<string>,
  baseUrl: string = ''
): ApiClient {
  return new ApiClient(baseUrl, getAccessToken)
}
