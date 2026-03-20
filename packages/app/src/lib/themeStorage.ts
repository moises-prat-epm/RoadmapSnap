/** Persisted theme so `html.dark` is correct before React/API (avoids light flash). */
export const THEME_STORAGE_KEY = 'roadmapsnap-theme'

export type StoredTheme = 'light' | 'dark'

export function readStoredTheme(): StoredTheme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'dark' || v === 'light') return v
  } catch {
    /* ignore */
  }
  return null
}

export function writeStoredTheme(theme: StoredTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function applyThemeClassToDocument(theme: StoredTheme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
