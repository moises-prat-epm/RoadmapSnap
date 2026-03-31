import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../api/client'
import { useCreateProject, useUpdateProject } from '../../hooks/useProjectMutations'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  project?: Project | null
}

interface FormValues {
  name: string
  group_name: string
  tags: string
  external_link: string
  at_risk: boolean
  descoped: boolean
  show_in_timeline: boolean
}

const emptyForm: FormValues = {
  name: '',
  group_name: '',
  tags: '',
  external_link: '',
  at_risk: false,
  descoped: false,
  show_in_timeline: true,
}

function projectToForm(p: Project): FormValues {
  return {
    name: p.name,
    group_name: p.group_name ?? '',
    tags: (p.tags ?? []).join(', '),
    external_link: p.external_link ?? '',
    at_risk: p.at_risk,
    descoped: p.descoped,
    show_in_timeline: p.show_in_timeline,
  }
}

export default function ProjectFormModal({ isOpen, onClose, workspaceId, project }: ProjectFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const isEdit = project != null

  const [values, setValues] = useState<FormValues>(emptyForm)
  const [serverError, setServerError] = useState<string | null>(null)
  const [addedCount, setAddedCount] = useState(0)

  const createMutation = useCreateProject(workspaceId)
  const updateMutation = useUpdateProject(workspaceId)
  const isPending = createMutation.isPending || updateMutation.isPending

  // Open / close the native dialog
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (isOpen) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [isOpen])

  // Sync form values when project changes (edit mode) or modal opens (create mode)
  useEffect(() => {
    if (isOpen) {
      setValues(isEdit ? projectToForm(project!) : emptyForm)
      setServerError(null)
      setAddedCount(0)
    }
  }, [isOpen, isEdit, project])

  // Auto-focus name field after open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on backdrop click
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  function set(field: keyof FormValues, value: string | boolean) {
    setValues((v) => ({ ...v, [field]: value }))
    setServerError(null)
  }

  function parseTags(raw: string): string[] {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const body = {
      name: values.name.trim(),
      group_name: values.group_name.trim() || null,
      tags: parseTags(values.tags),
      external_link: values.external_link.trim() || null,
      at_risk: values.at_risk,
      descoped: values.descoped,
      show_in_timeline: values.show_in_timeline,
    }

    if (!body.name) {
      setServerError('Name is required.')
      nameRef.current?.focus()
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ projectId: project!.id, body })
        onClose()
      } else {
        await createMutation.mutateAsync(body)
        setAddedCount((c) => c + 1)
        // Reset form for next entry (keep modal open)
        setValues(emptyForm)
        nameRef.current?.focus()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setServerError(msg)
    }
  }

  const title = isEdit ? 'Edit Project' : 'Add Project'
  const submitLabel = isEdit ? 'Save changes' : 'Add project'

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={onClose}
      className="w-full max-w-lg rounded-lg border border-border bg-bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-text-light hover:text-text-dark"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="proj-name" className="text-sm font-medium text-text-dark">
              Name <span className="text-risk">*</span>
            </label>
            <input
              ref={nameRef}
              id="proj-name"
              type="text"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Customer Portal v2"
              className="rounded border border-border bg-bg-white px-3 py-1.5 text-sm text-text-dark placeholder:text-text-light focus:border-m3 focus:outline-none focus:ring-1 focus:ring-m3"
              required
            />
          </div>

          {/* Group */}
          <div className="flex flex-col gap-1">
            <label htmlFor="proj-group" className="text-sm font-medium text-text-dark">
              Group
            </label>
            <input
              id="proj-group"
              type="text"
              value={values.group_name}
              onChange={(e) => set('group_name', e.target.value)}
              placeholder="e.g. Platform"
              className="rounded border border-border bg-bg-white px-3 py-1.5 text-sm text-text-dark placeholder:text-text-light focus:border-m3 focus:outline-none focus:ring-1 focus:ring-m3"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label htmlFor="proj-tags" className="text-sm font-medium text-text-dark">
              Tags
              <span className="ml-1 text-xs font-normal text-text-light">(comma-separated)</span>
            </label>
            <input
              id="proj-tags"
              type="text"
              value={values.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="e.g. frontend, Q3, priority"
              className="rounded border border-border bg-bg-white px-3 py-1.5 text-sm text-text-dark placeholder:text-text-light focus:border-m3 focus:outline-none focus:ring-1 focus:ring-m3"
            />
          </div>

          {/* External link */}
          <div className="flex flex-col gap-1">
            <label htmlFor="proj-link" className="text-sm font-medium text-text-dark">
              External link
            </label>
            <input
              id="proj-link"
              type="url"
              value={values.external_link}
              onChange={(e) => set('external_link', e.target.value)}
              placeholder="https://..."
              className="rounded border border-border bg-bg-white px-3 py-1.5 text-sm text-text-dark placeholder:text-text-light focus:border-m3 focus:outline-none focus:ring-1 focus:ring-m3"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-dark">
              <input
                type="checkbox"
                checked={values.at_risk}
                onChange={(e) => set('at_risk', e.target.checked)}
                className="rounded border-border accent-risk"
              />
              At risk
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-dark">
              <input
                type="checkbox"
                checked={values.descoped}
                onChange={(e) => set('descoped', e.target.checked)}
                className="rounded border-border"
              />
              Descoped
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-dark">
              <input
                type="checkbox"
                checked={values.show_in_timeline}
                onChange={(e) => set('show_in_timeline', e.target.checked)}
                className="rounded border-border"
              />
              Show in timeline
            </label>
          </div>

          {/* Server error */}
          {serverError && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {serverError}
            </p>
          )}

          {/* Success counter (create mode) */}
          {!isEdit && addedCount > 0 && (
            <p className="text-sm text-m2">
              {addedCount} project{addedCount > 1 ? 's' : ''} added — keep going or close when done.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-4 py-1.5 text-sm text-text-dark hover:bg-secondary"
          >
            {isEdit ? 'Cancel' : 'Done'}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-m3 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '…' : submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  )
}
