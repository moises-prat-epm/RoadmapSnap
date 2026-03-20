import { useQuery } from '@tanstack/react-query'
import { useApi } from './useApi'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isValidUuid(id: string | null): id is string {
  return typeof id === 'string' && id.length > 0 && UUID_REGEX.test(id)
}

export function useWorkspaces() {
  const api = useApi()
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.getWorkspaces(),
  })
}

export function useWorkspaceProjects(workspaceId: string | null) {
  const api = useApi()
  const enabled = isValidUuid(workspaceId)
  return useQuery({
    queryKey: ['workspace', workspaceId, 'projects'],
    queryFn: () => api.getWorkspaceProjects(workspaceId!),
    enabled,
  })
}
