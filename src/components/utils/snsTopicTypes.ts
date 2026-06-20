export const SNS_TOPIC_TYPE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "fifo", label: "FIFO" },
] as const

export type SnsTopicType = (typeof SNS_TOPIC_TYPE_OPTIONS)[number]["value"]

export interface SnsTopicConfig {
  topicName: string
  topicType: SnsTopicType
}

export const DEFAULT_SNS_TOPIC_TYPE: SnsTopicType = "standard"

export function getSnsTopicConfig(data: {
  topicName?: string
  topicType?: SnsTopicType
}): SnsTopicConfig {
  return {
    topicName: data.topicName ?? "",
    topicType: data.topicType ?? DEFAULT_SNS_TOPIC_TYPE,
  }
}
