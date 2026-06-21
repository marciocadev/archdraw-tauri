import type { SqsQueueSettings, SqsQueueSettingsInput } from "./sqsQueueTypes"
import { getSqsQueueSettings } from "./sqsQueueTypes"

export type SqsDlqConfig = SqsQueueSettings & {
  dlqName: string
}

export type SqsDlqConfigInput = SqsQueueSettingsInput & {
  dlqName?: string
}

export function getSqsDlqConfig(data: SqsDlqConfigInput): SqsDlqConfig {
  return {
    dlqName: data.dlqName ?? "",
    ...getSqsQueueSettings(data),
  }
}

export {
  SQS_QUEUE_NAME_MAX_LENGTH,
  SQS_QUEUE_NAME_RULES_TEXT,
} from "./sqsQueueTypes"
