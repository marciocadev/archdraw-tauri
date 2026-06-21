import type { SqsQueueSettings } from "../../../components/utils/sqsQueueTypes"
import { renderCdkDurationOption } from "./renderCdkDuration"

const standardVisibilityTimeoutValue = 30;
const standardVisibilityTimeoutUnit = "seconds";
const standardDeliveryDelayValue = 0;
const standardDeliveryDelayUnit = "seconds";
const standardReceiveMessageWaitTime = 0;
const standardRetentionPeriodValue = 4;
const standardRetentionPeriodUnit = "days";
const standardMaximumMessageSize = 1048576;

export function renderSqsQueueSettingsOptions(settings: SqsQueueSettings): string {

  let visibilityTimeoutObject = null;
  if (settings.visibilityTimeoutValue !== standardVisibilityTimeoutValue
    || settings.visibilityTimeoutUnit !== standardVisibilityTimeoutUnit) {
    visibilityTimeoutObject = renderCdkDurationOption(
      "visibilityTimeout",
      settings.visibilityTimeoutValue,
      settings.visibilityTimeoutUnit,
    );
  }

  let deliveryDelayObject = null;
  if (settings.deliveryDelayValue !== standardDeliveryDelayValue
    || settings.deliveryDelayUnit !== standardDeliveryDelayUnit) {
    deliveryDelayObject = renderCdkDurationOption(
      "deliveryDelay",
      settings.deliveryDelayValue,
      settings.deliveryDelayUnit,
    );
  }

  let receiveMessageWaitTimeObject = null;
  if (settings.receiveMessageWaitTime !== standardReceiveMessageWaitTime) {
    receiveMessageWaitTimeObject = renderCdkDurationOption(
      "receiveMessageWaitTime",
      settings.receiveMessageWaitTime,
      "seconds",
    );
  }

  let retentionPeriodObject = null;
  if (settings.messageRetentionValue !== standardRetentionPeriodValue
    || settings.messageRetentionUnit !== standardRetentionPeriodUnit) {
    retentionPeriodObject = renderCdkDurationOption(
      "retentionPeriod",
      settings.messageRetentionValue,
      settings.messageRetentionUnit,
    );
  }

  let maximumMessageSizeObject = null;
  if (settings.maximumMessageSizeKib * 1024 !== standardMaximumMessageSize) {
    maximumMessageSizeObject = `\n      maxMessageSizeBytes: ${settings.maximumMessageSizeKib * 1024},`;
  }

  return [
    visibilityTimeoutObject,
    deliveryDelayObject,
    receiveMessageWaitTimeObject,
    retentionPeriodObject,
    maximumMessageSizeObject,
  ].join("")
}
