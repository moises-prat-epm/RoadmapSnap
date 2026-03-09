import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { useCurrentUser } from '../../hooks/useRole'
import type { UserPreferences } from '../../api/client'

export default function ThemeToggle() {
  const api = useApi()
  const queryClient = useQueryClient()
  const { data } = useCurrentUser()
  const theme = data?.preferences?.theme ?? 'light'

  const mutation = useMutation({
    mutationFn: (next: UserPreferences['theme']) =>
      api.updateMe({ preferences: { theme: next } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const toggle = () => {
    const next: UserPreferences['theme'] = theme === 'dark' ? 'light' : 'dark'
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark')
    }
    mutation.mutate(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <span className="text-lg leading-none">☀</span>
      ) : (
        <span className="text-lg leading-none">☽</span>
      )}
    </button>
  )
}
