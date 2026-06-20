import { useEffect, useState, type ReactNode } from "react"

export interface ConfigPanelLayoutProps {
  isOpen: boolean
  title: string
  onConfirm: () => void
  onCancel: () => void
  children: ReactNode
}

export const ConfigPanelLayout = (props: ConfigPanelLayoutProps) => {
  const { isOpen, title, onConfirm, onCancel, children } = props
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      return
    }

    const timeoutId = window.setTimeout(() => setIsVisible(false), 300)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen])

  if (!isOpen && !isVisible) {
    return null
  }

  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "-translate-y-full"
        }`}>
      <div className="w-full border-b border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/95">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <h2 className="text-center text-sm font-[AmazonEmberBold] text-slate-700 dark:text-slate-200">
            {title}
          </h2>

          {children}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-500">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg px-4 py-2 text-sm bg-sky-600 text-white hover:bg-sky-500">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
