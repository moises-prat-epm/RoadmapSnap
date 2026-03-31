import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './useApi'
import type { CreateProjectBody } from '../api/client'

export function useCreateProject(workspaceId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectBody) => api.createProject(workspaceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'projects'] })
    },
  })
}

export function useUpdateProject(workspaceId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, body }: { projectId: string; body: Partial<CreateProjectBody> }) =>
      api.updateProject(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'projects'] })
    },
  })
}

export function useDeleteProject(workspaceId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => api.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'projects'] })
    },
  })
}
