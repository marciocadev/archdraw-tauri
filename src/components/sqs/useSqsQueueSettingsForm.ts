import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import type { SqsQueueSettings, SqsQueueSettingsErrors } from "../utils/sqsQueueTypes"
import {
  clampDeliveryDelayValue,
  clampMessageRetentionValue,
  clampSqsQueueSettings,
  clampVisibilityTimeoutValue,
  createEmptySqsQueueSettingsErrors,
  getDeliveryDelayLimits,
  getMessageRetentionLimits,
  getVisibilityTimeoutLimits,
  hasSqsQueueSettingsErrors,
  validateSqsQueueSettings,
  type DeliveryDelayUnit,
  type MessageRetentionUnit,
  type VisibilityTimeoutUnit,
} from "../utils/sqsQueueTypes"

export function useSqsQueueSettingsForm<T extends SqsQueueSettings>(
  isOpen: boolean,
  initialConfig: T,
) {
  const [config, setConfig] = useState(initialConfig)
  const [errors, setErrors] = useState<SqsQueueSettingsErrors>(createEmptySqsQueueSettingsErrors())

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig)
      setErrors(createEmptySqsQueueSettingsErrors())
    }
  }, [initialConfig, isOpen])

  const visibilityLimits = useMemo(
    () => getVisibilityTimeoutLimits(config.visibilityTimeoutUnit),
    [config.visibilityTimeoutUnit],
  )

  const deliveryDelayLimits = useMemo(
    () => getDeliveryDelayLimits(config.deliveryDelayUnit),
    [config.deliveryDelayUnit],
  )

  const messageRetentionLimits = useMemo(
    () => getMessageRetentionLimits(config.messageRetentionUnit),
    [config.messageRetentionUnit],
  )

  const clearErrors = () => {
    setErrors(createEmptySqsQueueSettingsErrors())
  }

  const handleVisibilityTimeoutValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({
      ...current,
      visibilityTimeoutValue: parsed,
    }))
    setErrors((current) => ({ ...current, visibilityTimeout: null }))
  }

  const handleVisibilityTimeoutUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const unit = event.target.value as VisibilityTimeoutUnit
    setConfig((current) => ({
      ...current,
      visibilityTimeoutUnit: unit,
      visibilityTimeoutValue: clampVisibilityTimeoutValue(current.visibilityTimeoutValue, unit),
    }))
    setErrors((current) => ({ ...current, visibilityTimeout: null }))
  }

  const handleDeliveryDelayValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({
      ...current,
      deliveryDelayValue: parsed,
    }))
    setErrors((current) => ({ ...current, deliveryDelay: null }))
  }

  const handleDeliveryDelayUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const unit = event.target.value as DeliveryDelayUnit
    setConfig((current) => ({
      ...current,
      deliveryDelayUnit: unit,
      deliveryDelayValue: clampDeliveryDelayValue(current.deliveryDelayValue, unit),
    }))
    setErrors((current) => ({ ...current, deliveryDelay: null }))
  }

  const handleReceiveMessageWaitTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({
      ...current,
      receiveMessageWaitTime: parsed,
    }))
    setErrors((current) => ({ ...current, receiveMessageWaitTime: null }))
  }

  const handleMessageRetentionValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({
      ...current,
      messageRetentionValue: parsed,
    }))
    setErrors((current) => ({ ...current, messageRetention: null }))
  }

  const handleMessageRetentionUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const unit = event.target.value as MessageRetentionUnit
    setConfig((current) => ({
      ...current,
      messageRetentionUnit: unit,
      messageRetentionValue: clampMessageRetentionValue(current.messageRetentionValue, unit),
    }))
    setErrors((current) => ({ ...current, messageRetention: null }))
  }

  const handleMaximumMessageSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({
      ...current,
      maximumMessageSizeKib: parsed,
    }))
    setErrors((current) => ({ ...current, maximumMessageSize: null }))
  }

  const validateSettings = (): SqsQueueSettings | null => {
    const nextErrors = validateSqsQueueSettings(config)
    setErrors(nextErrors)

    if (hasSqsQueueSettingsErrors(nextErrors)) {
      return null
    }

    return clampSqsQueueSettings(config)
  }

  return {
    config,
    setConfig,
    errors,
    visibilityLimits,
    deliveryDelayLimits,
    messageRetentionLimits,
    clearErrors,
    handleVisibilityTimeoutValueChange,
    handleVisibilityTimeoutUnitChange,
    handleDeliveryDelayValueChange,
    handleDeliveryDelayUnitChange,
    handleReceiveMessageWaitTimeChange,
    handleMessageRetentionValueChange,
    handleMessageRetentionUnitChange,
    handleMaximumMessageSizeChange,
    validateSettings,
  }
}
