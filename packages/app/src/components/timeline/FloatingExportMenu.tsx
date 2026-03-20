import { useState, useEffect, useRef, useCallback } from 'react'

const downloadIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

export interface FloatingExportMenuProps {
  onExportPNG: () => void
  onExportCSV: () => void
  onExportJSON: () => void
}

/**
 * Fixed bottom-right export trigger; opens menu with PNG / CSV / JSON (replaces inline export bar).
 */
export default function FloatingExportMenu({ onExportPNG, onExportCSV, onExportJSON }: FloatingExportMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div ref={rootRef} className="floating-export-fab">
      {open && (
        <div className="floating-export-fab__menu" role="menu" aria-label="Export options">
          <button
            type="button"
            role="menuitem"
            className="floating-export-fab__item"
            onClick={() => {
              onExportPNG()
              close()
            }}
          >
            Export PNG
          </button>
          <button
            type="button"
            role="menuitem"
            className="floating-export-fab__item"
            onClick={() => {
              onExportCSV()
              close()
            }}
          >
            CSV
          </button>
          <button
            type="button"
            role="menuitem"
            className="floating-export-fab__item"
            onClick={() => {
              onExportJSON()
              close()
            }}
          >
            JSON
          </button>
        </div>
      )}
      <button
        type="button"
        className="floating-export-fab__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Close export menu' : 'Open export menu'}
        onClick={() => setOpen((o) => !o)}
      >
        {downloadIcon}
      </button>
    </div>
  )
}
