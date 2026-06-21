import { useEffect, useState, type ChangeEvent } from "react"
import {
  CONNECTION_PATH_OPTIONS,
  type ConnectionDraft,
  type ConnectionPathType,
} from "./utils/connectionTypes"

export interface ConnectionConfigPanelProps {
  isOpen: boolean;
  initialDraft: ConnectionDraft;
  onConfirm: (draft: ConnectionDraft) => void;
  onCancel: () => void;
  onDisconnect: () => void;
}

export const ConnectionConfigPanel = (props: ConnectionConfigPanelProps) => {
  const { isOpen, initialDraft, onConfirm, onCancel, onDisconnect } = props
  const [isVisible, setIsVisible] = useState(false)
  const [draft, setDraft] = useState<ConnectionDraft>(initialDraft)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setDraft(initialDraft)
      return
    }

    const timeoutId = window.setTimeout(() => setIsVisible(false), 300)
    return () => window.clearTimeout(timeoutId)
  }, [initialDraft, isOpen])

  if (!isOpen && !isVisible) {
    return null
  }

  const handleLabelChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft((current) => ({ ...current, label: event.target.value }))
  }

  const handlePathTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDraft((current) => ({
      ...current,
      pathType: event.target.value as ConnectionPathType,
    }))
  }

  const handleConfirm = () => {
    onConfirm(draft)
  }

  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "-translate-y-full"
        }`}>
      <div className="w-full border-b border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/95">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-[AmazonEmberBold] text-slate-700 dark:text-slate-200">
            Connection Settings
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="connection-path-type"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Line Type
            </label>
            <select
              id="connection-path-type"
              value={draft.pathType}
              onChange={handlePathTypeChange}
              className="form-select rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
              {CONNECTION_PATH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="connection-label"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Connection Label
            </label>
            <textarea
              id="connection-label"
              value={draft.label}
              onChange={handleLabelChange}
              rows={3}
              placeholder="Enter the text displayed on the connection"
              className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            After saving, drag the label directly on the line to reposition it.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-lg px-4 py-2 text-sm bg-amber-600 text-white hover:bg-amber-500">
            Remove Connection
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-500">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg px-4 py-2 text-sm bg-sky-600 text-white hover:bg-sky-500">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
