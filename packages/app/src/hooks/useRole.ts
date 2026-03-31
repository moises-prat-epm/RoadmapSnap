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
  const { data } = useCurrentUser()
  const role: Role = (data?.role as Role) ?? 'viewer'
  return {
    role,
    can: (minimumRole: Role) => ROLE_LEVEL[role] >= ROLE_LEVEL[minimumRole],
  }
}
