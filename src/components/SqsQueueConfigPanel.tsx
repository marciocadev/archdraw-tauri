import { useEffect, useState, type ChangeEvent } from "react"
import { ConfigPanelLayout } from "./config/ConfigPanelLayout"
import {
  type SqsQueueConfig,
} from "./utils/sqsQueueTypes"

export interface SqsQueueConfigPanelProps {
  isOpen: boolean
  initialConfig: SqsQueueConfig
  onConfirm: (config: SqsQueueConfig) => void
  onCancel: () => void
}

export const SqsQueueConfigPanel = (props: SqsQueueConfigPanelProps) => {
  const { isOpen, initialConfig, onConfirm, onCancel } = props
  const [config, setConfig] = useState<SqsQueueConfig>(initialConfig)

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig)
    }
  }, [initialConfig, isOpen])

  const handleQueueNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((current) => ({ ...current, queueName: event.target.value }))
  }

  return (
    <ConfigPanelLayout
      isOpen={isOpen}
      title="SQS Queue Settings"
      onConfirm={() => onConfirm(config)}
      onCancel={onCancel}>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="sqs-queue-name"
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Queue Name
        </label>
        <input
          id="sqs-queue-name"
          type="text"
          value={config.queueName}
          onChange={handleQueueNameChange}
          placeholder="Enter the queue name"
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
        />
      </div>
    </ConfigPanelLayout>
  )
}
