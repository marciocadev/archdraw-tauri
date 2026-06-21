import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { isValidStackName } from "../codegen/sanitizeNames"

export interface StackNameDialogProps {
  isOpen: boolean
  title: string
  onConfirm: (stackName: string) => void
  onCancel: () => void
}

export const StackNameDialog = (props: StackNameDialogProps) => {
  const { isOpen, title, onConfirm, onCancel } = props
  const [stackName, setStackName] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setStackName("")
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleStackNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStackName(event.target.value)
    setError(null)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const trimmed = stackName.trim()
    if (!isValidStackName(trimmed)) {
      setError("Enter a valid stack name.")
      return
    }

    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-center text-sm font-[AmazonEmberBold] text-slate-700 dark:text-slate-200">
          {title}
        </h2>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="stack-name"
            className="text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            Stack Name
          </label>
          <input
            id="stack-name"
            type="text"
            value={stackName}
            onChange={handleStackNameChange}
            placeholder="my-architecture-stack"
            autoFocus
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
          />
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-500"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
