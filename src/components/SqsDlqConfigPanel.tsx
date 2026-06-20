import { useEffect, useState, type ChangeEvent } from "react"
import { ConfigPanelLayout } from "./config/ConfigPanelLayout"
import {
  type SqsDlqConfig,
} from "./utils/sqsDlqTypes"

export interface SqsDlqConfigPanelProps {
  isOpen: boolean
  initialConfig: SqsDlqConfig
  onConfirm: (config: SqsDlqConfig) => void
  onCancel: () => void
}

export const SqsDlqConfigPanel = (props: SqsDlqConfigPanelProps) => {
  const { isOpen, initialConfig, onConfirm, onCancel } = props
  const [config, setConfig] = useState<SqsDlqConfig>(initialConfig)

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig)
    }
  }, [initialConfig, isOpen])

  const handleDlqNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((current) => ({ ...current, dlqName: event.target.value }))
  }

  return (
    <ConfigPanelLayout
      isOpen={isOpen}
      title="SQS Dead Letter Queue Settings"
      onConfirm={() => onConfirm(config)}
      onCancel={onCancel}>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="sqs-dlq-name"
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Queue Name
        </label>
        <input
          id="sqs-dlq-name"
          type="text"
          value={config.dlqName}
          onChange={handleDlqNameChange}
          placeholder="Enter the dead letter queue name"
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
        />
      </div>
    </ConfigPanelLayout>
  )
}
