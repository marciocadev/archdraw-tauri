export interface SqsQueueSettings {
  visibilityTimeoutValue: number
  visibilityTimeoutUnit: VisibilityTimeoutUnit
  deliveryDelayValue: number
  deliveryDelayUnit: DeliveryDelayUnit
  receiveMessageWaitTime: number
  messageRetentionValue: number
  messageRetentionUnit: MessageRetentionUnit
  maximumMessageSizeKib: number
}

export type SqsQueueConfig = SqsQueueSettings & {
  queueName: string
}

export interface SqsQueueSettingsErrors {
  visibilityTimeout: string | null
  deliveryDelay: string | null
  receiveMessageWaitTime: string | null
  messageRetention: string | null
  maximumMessageSize: string | null
}

export function createEmptySqsQueueSettingsErrors(): SqsQueueSettingsErrors {
  return {
    visibilityTimeout: null,
    deliveryDelay: null,
    receiveMessageWaitTime: null,
    messageRetention: null,
    maximumMessageSize: null,
  }
}

export function hasSqsQueueSettingsErrors(errors: SqsQueueSettingsErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export const SQS_QUEUE_NAME_MAX_LENGTH = 80

export const SQS_QUEUE_NAME_RULES_TEXT =
  "A queue name is case-sensitive and can have up to 80 characters. You can use alphanumeric characters, hyphens (-), and underscores ( _ )."

export const VISIBILITY_TIMEOUT_UNITS = ["seconds", "minutes", "hours"] as const

export type VisibilityTimeoutUnit = (typeof VISIBILITY_TIMEOUT_UNITS)[number]

export const DEFAULT_VISIBILITY_TIMEOUT_VALUE = 30
export const DEFAULT_VISIBILITY_TIMEOUT_UNIT: VisibilityTimeoutUnit = "seconds"
export const VISIBILITY_TIMEOUT_MIN_SECONDS = 0
export const VISIBILITY_TIMEOUT_MAX_SECONDS = 12 * 60 * 60

export const VISIBILITY_TIMEOUT_UNIT_LABELS: Record<VisibilityTimeoutUnit, string> = {
  seconds: "Seconds",
  minutes: "Minutes",
  hours: "Hours",
}

export interface VisibilityTimeoutLimits {
  min: number
  max: number
}

export function getVisibilityTimeoutLimits(unit: VisibilityTimeoutUnit): VisibilityTimeoutLimits {
  switch (unit) {
    case "minutes":
      return { min: 0, max: VISIBILITY_TIMEOUT_MAX_SECONDS / 60 }
    case "hours":
      return { min: 0, max: VISIBILITY_TIMEOUT_MAX_SECONDS / 3600 }
    default:
      return { min: VISIBILITY_TIMEOUT_MIN_SECONDS, max: VISIBILITY_TIMEOUT_MAX_SECONDS }
  }
}

export function visibilityTimeoutToSeconds(
  value: number,
  unit: VisibilityTimeoutUnit,
): number {
  switch (unit) {
    case "minutes":
      return value * 60
    case "hours":
      return value * 3600
    default:
      return value
  }
}

export function clampVisibilityTimeoutValue(
  value: number,
  unit: VisibilityTimeoutUnit,
): number {
  const limits = getVisibilityTimeoutLimits(unit)
  return Math.min(Math.max(value, limits.min), limits.max)
}

export function validateVisibilityTimeout(
  value: number,
  unit: VisibilityTimeoutUnit,
): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for visibility timeout."
  }

  const limits = getVisibilityTimeoutLimits(unit)
  if (value < limits.min || value > limits.max) {
    return `Visibility timeout must be between ${limits.min} and ${limits.max} ${unit}.`
  }

  const totalSeconds = visibilityTimeoutToSeconds(value, unit)
  if (
    totalSeconds < VISIBILITY_TIMEOUT_MIN_SECONDS
    || totalSeconds > VISIBILITY_TIMEOUT_MAX_SECONDS
  ) {
    return "Visibility timeout must be between 0 seconds and 12 hours."
  }

  return null
}

export const DELIVERY_DELAY_UNITS = ["seconds", "minutes"] as const

export type DeliveryDelayUnit = (typeof DELIVERY_DELAY_UNITS)[number]

export const DEFAULT_DELIVERY_DELAY_VALUE = 0
export const DEFAULT_DELIVERY_DELAY_UNIT: DeliveryDelayUnit = "seconds"
export const DELIVERY_DELAY_MIN_SECONDS = 0
export const DELIVERY_DELAY_MAX_SECONDS = 15 * 60

export const DELIVERY_DELAY_UNIT_LABELS: Record<DeliveryDelayUnit, string> = {
  seconds: "Seconds",
  minutes: "Minutes",
}

export function getDeliveryDelayLimits(unit: DeliveryDelayUnit): VisibilityTimeoutLimits {
  switch (unit) {
    case "minutes":
      return { min: 0, max: DELIVERY_DELAY_MAX_SECONDS / 60 }
    default:
      return { min: DELIVERY_DELAY_MIN_SECONDS, max: DELIVERY_DELAY_MAX_SECONDS }
  }
}

export function deliveryDelayToSeconds(value: number, unit: DeliveryDelayUnit): number {
  return unit === "minutes" ? value * 60 : value
}

export function clampDeliveryDelayValue(value: number, unit: DeliveryDelayUnit): number {
  const limits = getDeliveryDelayLimits(unit)
  return Math.min(Math.max(value, limits.min), limits.max)
}

export function validateDeliveryDelay(value: number, unit: DeliveryDelayUnit): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for delivery delay."
  }

  const limits = getDeliveryDelayLimits(unit)
  if (value < limits.min || value > limits.max) {
    return `Delivery delay must be between ${limits.min} and ${limits.max} ${unit}.`
  }

  const totalSeconds = deliveryDelayToSeconds(value, unit)
  if (totalSeconds < DELIVERY_DELAY_MIN_SECONDS || totalSeconds > DELIVERY_DELAY_MAX_SECONDS) {
    return "Delivery delay must be between 0 seconds and 15 minutes."
  }

  return null
}

export const DEFAULT_RECEIVE_MESSAGE_WAIT_TIME = 0
export const RECEIVE_MESSAGE_WAIT_TIME_MIN_SECONDS = 0
export const RECEIVE_MESSAGE_WAIT_TIME_MAX_SECONDS = 20

export function clampReceiveMessageWaitTime(value: number): number {
  return Math.min(
    Math.max(value, RECEIVE_MESSAGE_WAIT_TIME_MIN_SECONDS),
    RECEIVE_MESSAGE_WAIT_TIME_MAX_SECONDS,
  )
}

export function validateReceiveMessageWaitTime(value: number): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for receive message wait time."
  }

  if (
    value < RECEIVE_MESSAGE_WAIT_TIME_MIN_SECONDS
    || value > RECEIVE_MESSAGE_WAIT_TIME_MAX_SECONDS
  ) {
    return "Receive message wait time must be between 0 and 20 seconds."
  }

  return null
}

export const MESSAGE_RETENTION_UNITS = ["minutes", "hours", "days"] as const

export type MessageRetentionUnit = (typeof MESSAGE_RETENTION_UNITS)[number]

export const DEFAULT_MESSAGE_RETENTION_VALUE = 4
export const DEFAULT_MESSAGE_RETENTION_UNIT: MessageRetentionUnit = "days"
export const MESSAGE_RETENTION_MIN_SECONDS = 60
export const MESSAGE_RETENTION_MAX_SECONDS = 14 * 24 * 60 * 60

export const MESSAGE_RETENTION_UNIT_LABELS: Record<MessageRetentionUnit, string> = {
  minutes: "Minutes",
  hours: "Hours",
  days: "Days",
}

export function getMessageRetentionLimits(unit: MessageRetentionUnit): VisibilityTimeoutLimits {
  switch (unit) {
    case "hours":
      return { min: 1, max: MESSAGE_RETENTION_MAX_SECONDS / 3600 }
    case "days":
      return { min: 1, max: MESSAGE_RETENTION_MAX_SECONDS / 86400 }
    default:
      return { min: 1, max: MESSAGE_RETENTION_MAX_SECONDS / 60 }
  }
}

export function messageRetentionToSeconds(
  value: number,
  unit: MessageRetentionUnit,
): number {
  switch (unit) {
    case "hours":
      return value * 3600
    case "days":
      return value * 86400
    default:
      return value * 60
  }
}

export function clampMessageRetentionValue(
  value: number,
  unit: MessageRetentionUnit,
): number {
  const limits = getMessageRetentionLimits(unit)
  return Math.min(Math.max(value, limits.min), limits.max)
}

export function validateMessageRetention(
  value: number,
  unit: MessageRetentionUnit,
): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for message retention period."
  }

  const limits = getMessageRetentionLimits(unit)
  if (value < limits.min || value > limits.max) {
    return `Message retention period must be between ${limits.min} and ${limits.max} ${unit}.`
  }

  const totalSeconds = messageRetentionToSeconds(value, unit)
  if (
    totalSeconds < MESSAGE_RETENTION_MIN_SECONDS
    || totalSeconds > MESSAGE_RETENTION_MAX_SECONDS
  ) {
    return "Message retention period must be between 1 minute and 14 days."
  }

  return null
}

export const DEFAULT_MAXIMUM_MESSAGE_SIZE_KIB = 1024
export const MAXIMUM_MESSAGE_SIZE_MIN_KIB = 1
export const MAXIMUM_MESSAGE_SIZE_MAX_KIB = 1024

export function clampMaximumMessageSizeKib(value: number): number {
  return Math.min(
    Math.max(value, MAXIMUM_MESSAGE_SIZE_MIN_KIB),
    MAXIMUM_MESSAGE_SIZE_MAX_KIB,
  )
}

export function validateMaximumMessageSizeKib(value: number): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for maximum message size."
  }

  if (value < MAXIMUM_MESSAGE_SIZE_MIN_KIB || value > MAXIMUM_MESSAGE_SIZE_MAX_KIB) {
    return "Maximum message size must be between 1 KiB and 1024 KiB."
  }

  return null
}

export interface SqsQueueConfigInput extends SqsQueueSettingsInput {
  queueName?: string
}

export interface SqsQueueSettingsInput {
  visibilityTimeoutValue?: number
  visibilityTimeoutUnit?: VisibilityTimeoutUnit
  deliveryDelayValue?: number
  deliveryDelayUnit?: DeliveryDelayUnit
  receiveMessageWaitTime?: number
  messageRetentionValue?: number
  messageRetentionUnit?: MessageRetentionUnit
  maximumMessageSizeKib?: number
}

export function getSqsQueueSettings(data: SqsQueueSettingsInput): SqsQueueSettings {
  const visibilityUnit = data.visibilityTimeoutUnit ?? DEFAULT_VISIBILITY_TIMEOUT_UNIT
  const visibilityRawValue = data.visibilityTimeoutValue ?? DEFAULT_VISIBILITY_TIMEOUT_VALUE
  const deliveryDelayUnit = data.deliveryDelayUnit ?? DEFAULT_DELIVERY_DELAY_UNIT
  const deliveryDelayRawValue = data.deliveryDelayValue ?? DEFAULT_DELIVERY_DELAY_VALUE
  const receiveMessageWaitTimeRawValue =
    data.receiveMessageWaitTime ?? DEFAULT_RECEIVE_MESSAGE_WAIT_TIME
  const messageRetentionUnit = data.messageRetentionUnit ?? DEFAULT_MESSAGE_RETENTION_UNIT
  const messageRetentionRawValue = data.messageRetentionValue ?? DEFAULT_MESSAGE_RETENTION_VALUE
  const maximumMessageSizeKibRawValue =
    data.maximumMessageSizeKib ?? DEFAULT_MAXIMUM_MESSAGE_SIZE_KIB

  return {
    visibilityTimeoutValue: clampVisibilityTimeoutValue(visibilityRawValue, visibilityUnit),
    visibilityTimeoutUnit: visibilityUnit,
    deliveryDelayValue: clampDeliveryDelayValue(deliveryDelayRawValue, deliveryDelayUnit),
    deliveryDelayUnit: deliveryDelayUnit,
    receiveMessageWaitTime: clampReceiveMessageWaitTime(receiveMessageWaitTimeRawValue),
    messageRetentionValue: clampMessageRetentionValue(messageRetentionRawValue, messageRetentionUnit),
    messageRetentionUnit: messageRetentionUnit,
    maximumMessageSizeKib: clampMaximumMessageSizeKib(maximumMessageSizeKibRawValue),
  }
}

export function validateSqsQueueSettings(settings: SqsQueueSettings): SqsQueueSettingsErrors {
  return {
    visibilityTimeout: validateVisibilityTimeout(
      settings.visibilityTimeoutValue,
      settings.visibilityTimeoutUnit,
    ),
    deliveryDelay: validateDeliveryDelay(
      settings.deliveryDelayValue,
      settings.deliveryDelayUnit,
    ),
    receiveMessageWaitTime: validateReceiveMessageWaitTime(settings.receiveMessageWaitTime),
    messageRetention: validateMessageRetention(
      settings.messageRetentionValue,
      settings.messageRetentionUnit,
    ),
    maximumMessageSize: validateMaximumMessageSizeKib(settings.maximumMessageSizeKib),
  }
}

export function clampSqsQueueSettings(settings: SqsQueueSettings): SqsQueueSettings {
  return {
    visibilityTimeoutValue: clampVisibilityTimeoutValue(
      settings.visibilityTimeoutValue,
      settings.visibilityTimeoutUnit,
    ),
    visibilityTimeoutUnit: settings.visibilityTimeoutUnit,
    deliveryDelayValue: clampDeliveryDelayValue(
      settings.deliveryDelayValue,
      settings.deliveryDelayUnit,
    ),
    deliveryDelayUnit: settings.deliveryDelayUnit,
    receiveMessageWaitTime: clampReceiveMessageWaitTime(settings.receiveMessageWaitTime),
    messageRetentionValue: clampMessageRetentionValue(
      settings.messageRetentionValue,
      settings.messageRetentionUnit,
    ),
    messageRetentionUnit: settings.messageRetentionUnit,
    maximumMessageSizeKib: clampMaximumMessageSizeKib(settings.maximumMessageSizeKib),
  }
}

export function getSqsQueueConfig(data: SqsQueueConfigInput): SqsQueueConfig {
  return {
    queueName: data.queueName ?? "",
    ...getSqsQueueSettings(data),
  }
}
