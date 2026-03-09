import { useQuery } from '@tanstack/react-query'
import { useApi } from './useApi'

type Role = 'viewer' | 'editor' | 'admin'
const ROLE_LEVEL: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 }

export function useCurrentUser() {
  const api = useApi()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe(),
  })
}

export function useRole() {
  useCurrentUser() // for future: derive role from me or workspace context
  // role is returned in WorkspaceWithProjects response in a later step
  // For now derive from the me endpoint — will be workspace-scoped in Epic 3
  return {
    role: 'viewer' as Role, // TODO Epic 3: real role from workspace context
    can: (minimumRole: Role) => ROLE_LEVEL['viewer'] >= ROLE_LEVEL[minimumRole],
  }
}
