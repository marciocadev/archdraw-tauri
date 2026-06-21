import type { SqsQueueSettings } from "../../../components/utils/sqsQueueTypes"
import {
  sqsDeliveryDelayToSeconds,
  sqsMessageRetentionToSeconds,
  sqsVisibilityTimeoutToSeconds,
} from "./renderTerraformDuration"

const standardVisibilityTimeoutValue = 30
const standardVisibilityTimeoutUnit = "seconds"
const standardDeliveryDelayValue = 0
const standardDeliveryDelayUnit = "seconds"
const standardReceiveMessageWaitTime = 0
const standardRetentionPeriodValue = 4
const standardRetentionPeriodUnit = "days"
const standardMaximumMessageSize = 1048576

export function renderSqsQueueSettingsAttributes(settings: SqsQueueSettings): string {
  const attributes: string[] = []

  if (
    settings.visibilityTimeoutValue !== standardVisibilityTimeoutValue
    || settings.visibilityTimeoutUnit !== standardVisibilityTimeoutUnit
  ) {
    attributes.push(
      `  visibility_timeout_seconds = ${sqsVisibilityTimeoutToSeconds(settings.visibilityTimeoutValue, settings.visibilityTimeoutUnit)}`,
    )
  }

  if (
    settings.deliveryDelayValue !== standardDeliveryDelayValue
    || settings.deliveryDelayUnit !== standardDeliveryDelayUnit
  ) {
    attributes.push(
      `  delay_seconds = ${sqsDeliveryDelayToSeconds(settings.deliveryDelayValue, settings.deliveryDelayUnit)}`,
    )
  }

  if (settings.receiveMessageWaitTime !== standardReceiveMessageWaitTime) {
    attributes.push(`  receive_wait_time_seconds = ${settings.receiveMessageWaitTime}`)
  }

  if (
    settings.messageRetentionValue !== standardRetentionPeriodValue
    || settings.messageRetentionUnit !== standardRetentionPeriodUnit
  ) {
    attributes.push(
      `  message_retention_seconds = ${sqsMessageRetentionToSeconds(settings.messageRetentionValue, settings.messageRetentionUnit)}`,
    )
  }

  if (settings.maximumMessageSizeKib * 1024 !== standardMaximumMessageSize) {
    attributes.push(`  max_message_size = ${settings.maximumMessageSizeKib * 1024}`)
  }

  return attributes.length > 0 ? `\n${attributes.join("\n")}` : ""
}
