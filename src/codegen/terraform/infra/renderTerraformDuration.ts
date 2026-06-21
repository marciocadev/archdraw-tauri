import type { DeliveryDelayUnit, MessageRetentionUnit, VisibilityTimeoutUnit } from "../../../components/utils/sqsQueueTypes"
import { deliveryDelayToSeconds, messageRetentionToSeconds, visibilityTimeoutToSeconds } from "../../../components/utils/sqsQueueTypes"

export function sqsVisibilityTimeoutToSeconds(
  value: number,
  unit: VisibilityTimeoutUnit,
): number {
  return visibilityTimeoutToSeconds(value, unit)
}

export function sqsDeliveryDelayToSeconds(
  value: number,
  unit: DeliveryDelayUnit,
): number {
  return deliveryDelayToSeconds(value, unit)
}

export function sqsMessageRetentionToSeconds(
  value: number,
  unit: MessageRetentionUnit,
): number {
  return messageRetentionToSeconds(value, unit)
}
