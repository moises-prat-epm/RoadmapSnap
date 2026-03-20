import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { useCurrentUser } from '../../hooks/useRole'
import type { UserPreferences } from '../../api/client'
import { applyThemeClassToDocument, writeStoredTheme } from '../../lib/themeStorage'

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
    const stored = next === 'dark' ? 'dark' : 'light'
    applyThemeClassToDocument(stored)
    writeStoredTheme(stored)
    mutation.mutate(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-text-light hover:bg-secondary hover:text-text-dark"
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
