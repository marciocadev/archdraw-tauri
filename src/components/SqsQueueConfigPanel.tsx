import { useState, type ChangeEvent } from "react"
import { ConfigPanelLayout } from "./config/ConfigPanelLayout"
import { SqsQueueSettingsFields } from "./sqs/SqsQueueSettingsFields"
import { useSqsQueueSettingsForm } from "./sqs/useSqsQueueSettingsForm"
import {
  SQS_QUEUE_NAME_MAX_LENGTH,
  SQS_QUEUE_NAME_RULES_TEXT,
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
  const [configHidden, setConfigHidden] = useState(true)
  const {
    config,
    setConfig,
    errors,
    visibilityLimits,
    deliveryDelayLimits,
    messageRetentionLimits,
    handleVisibilityTimeoutValueChange,
    handleVisibilityTimeoutUnitChange,
    handleDeliveryDelayValueChange,
    handleDeliveryDelayUnitChange,
    handleReceiveMessageWaitTimeChange,
    handleMessageRetentionValueChange,
    handleMessageRetentionUnitChange,
    handleMaximumMessageSizeChange,
    validateSettings,
  } = useSqsQueueSettingsForm(isOpen, initialConfig)

  const handleQueueNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((current) => ({ ...current, queueName: event.target.value }))
  }

  const handleConfirm = () => {
    const validatedSettings = validateSettings()
    if (!validatedSettings) {
      return
    }

    onConfirm({
      ...validatedSettings,
      queueName: config.queueName.trim(),
    })
  }

  return (
    <ConfigPanelLayout
      isOpen={isOpen}
      title="SQS Queue Settings"
      onConfirm={handleConfirm}
      onCancel={onCancel}>
      <div className="flex flex-col gap-3">
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
            maxLength={SQS_QUEUE_NAME_MAX_LENGTH}
            placeholder="Enter the queue name"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {SQS_QUEUE_NAME_RULES_TEXT}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfigHidden(!configHidden)}
          className="inline-flex items-center gap-1.5 self-start px-2 py-1 text-xs text-slate-500 dark:text-slate-400 cursor-pointer rounded-full hover:bg-mist-100 dark:hover:bg-mist-950">
          <span>Configuration</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0 transition-none"
            style={{ transform: `${configHidden ? "rotate(0deg)" : "rotate(90deg)"}` }}>
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div className={`${configHidden ? "hidden" : ""}`}>
          <SqsQueueSettingsFields
            idPrefix="sqs-queue"
            config={config}
            errors={errors}
            visibilityLimits={visibilityLimits}
            deliveryDelayLimits={deliveryDelayLimits}
            messageRetentionLimits={messageRetentionLimits}
            onVisibilityTimeoutValueChange={handleVisibilityTimeoutValueChange}
            onVisibilityTimeoutUnitChange={handleVisibilityTimeoutUnitChange}
            onDeliveryDelayValueChange={handleDeliveryDelayValueChange}
            onDeliveryDelayUnitChange={handleDeliveryDelayUnitChange}
            onReceiveMessageWaitTimeChange={handleReceiveMessageWaitTimeChange}
            onMessageRetentionValueChange={handleMessageRetentionValueChange}
            onMessageRetentionUnitChange={handleMessageRetentionUnitChange}
            onMaximumMessageSizeChange={handleMaximumMessageSizeChange}
          />
        </div>
      </div>
    </ConfigPanelLayout>
  )
}
