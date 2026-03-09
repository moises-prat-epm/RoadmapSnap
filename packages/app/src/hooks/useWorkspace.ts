import { useQuery } from '@tanstack/react-query'
import { useApi } from './useApi'

export function useWorkspaces() {
  const api = useApi()
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.getWorkspaces(),
  })
}

export function useWorkspaceProjects(workspaceId: string | null) {
  const api = useApi()
  return useQuery({
    queryKey: ['workspace', workspaceId, 'projects'],
    queryFn: () => api.getWorkspaceProjects(workspaceId!),
    enabled: !!workspaceId,
  })
}
