import { useEffect, useState, type ChangeEvent } from "react"
import { ConfigPanelLayout } from "./config/ConfigPanelLayout"
import {
  SNS_TOPIC_NAME_MAX_LENGTH,
  SNS_TOPIC_NAME_RULES_TEXT,
  SNS_TOPIC_TYPE_OPTIONS,
  validateSnsTopicName,
  type SnsTopicConfig,
  type SnsTopicType,
} from "./utils/snsTopicTypes"

export interface SnsTopicConfigPanelProps {
  isOpen: boolean
  initialConfig: SnsTopicConfig
  onConfirm: (config: SnsTopicConfig) => void
  onCancel: () => void
}

export const SnsTopicConfigPanel = (props: SnsTopicConfigPanelProps) => {
  const { isOpen, initialConfig, onConfirm, onCancel } = props
  const [config, setConfig] = useState<SnsTopicConfig>(initialConfig)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig)
      setError(null)
    }
  }, [initialConfig, isOpen])

  const handleTopicNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((current) => ({ ...current, topicName: event.target.value }))
    setError(null)
  }

  const handleTopicTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((current) => ({
      ...current,
      topicType: event.target.value as SnsTopicType,
    }))
    setError(null)
  }

  const handleConfirm = () => {
    const validationError = validateSnsTopicName(config.topicName, config.topicType)
    if (validationError) {
      setError(validationError)
      return
    }

    onConfirm({
      ...config,
      topicName: config.topicName.trim(),
    })
  }

  return (
    <ConfigPanelLayout
      isOpen={isOpen}
      title="SNS Topic Settings"
      onConfirm={handleConfirm}
      onCancel={onCancel}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="sns-topic-name"
            className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Topic Name
          </label>
          <input
            id="sns-topic-name"
            type="text"
            value={config.topicName}
            onChange={handleTopicNameChange}
            maxLength={SNS_TOPIC_NAME_MAX_LENGTH}
            placeholder="Enter the topic name"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {SNS_TOPIC_NAME_RULES_TEXT}
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="sns-topic-type"
            className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Topic Type
          </label>
          <select
            id="sns-topic-type"
            value={config.topicType}
            onChange={handleTopicTypeChange}
            className="form-select w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
            {SNS_TOPIC_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ConfigPanelLayout>
  )
}
