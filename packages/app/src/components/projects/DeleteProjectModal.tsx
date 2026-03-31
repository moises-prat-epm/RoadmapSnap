import { useEffect, useRef } from 'react'
import type { Project } from '../../api/client'
import { useDeleteProject } from '../../hooks/useProjectMutations'

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  workspaceId: string
}

export default function DeleteProjectModal({ isOpen, onClose, project, workspaceId }: DeleteProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const deleteMutation = useDeleteProject(workspaceId)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (isOpen) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [isOpen])

  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  async function handleDelete() {
    if (!project) return
    await deleteMutation.mutateAsync(project.id)
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={onClose}
      className="w-full max-w-sm rounded-lg border border-border bg-bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 px-5 py-5">
        <h2 className="text-base font-semibold text-text-dark">Delete project</h2>
        <p className="text-sm text-text-dark">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{project?.name}</span>?
        </p>
        <p className="text-sm text-text-light">
          This will permanently delete the project and all its milestones. This action cannot be undone.
        </p>

        {deleteMutation.isError && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete project.'}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-4 py-1.5 text-sm text-text-dark hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded bg-risk px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
