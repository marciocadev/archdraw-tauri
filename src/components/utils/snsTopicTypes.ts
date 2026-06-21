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

export const SNS_TOPIC_NAME_RULES_TEXT =
  "Maximum 256 characters. Can include alphanumeric characters, hyphens (-) and underscores (_). FIFO topic names must end with \".fifo\"."

export const SNS_TOPIC_NAME_MAX_LENGTH = 256

export interface SnsTopicConfigInput {
  topicName?: string
  topicType?: SnsTopicType
}

export function getSnsTopicConfig(data: SnsTopicConfigInput): SnsTopicConfig {
  return {
    topicName: data.topicName ?? "",
    topicType: data.topicType ?? DEFAULT_SNS_TOPIC_TYPE,
  }
}

export function validateSnsTopicName(
  topicName: string,
  topicType: SnsTopicType,
): string | null {
  const trimmed = topicName.trim()

  if (!trimmed) {
    return "Topic name is required."
  }

  if (trimmed.length > SNS_TOPIC_NAME_MAX_LENGTH) {
    return `Topic name must be at most ${SNS_TOPIC_NAME_MAX_LENGTH} characters.`
  }

  if (topicType === "fifo") {
    if (!trimmed.endsWith(".fifo")) {
      return "FIFO topic names must end with \".fifo\"."
    }

    const nameWithoutSuffix = trimmed.slice(0, -".fifo".length)
    if (!nameWithoutSuffix || !/^[a-zA-Z0-9_-]+$/.test(nameWithoutSuffix)) {
      return "Topic name can only include alphanumeric characters, hyphens (-) and underscores (_)."
    }

    return null
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return "Topic name can only include alphanumeric characters, hyphens (-) and underscores (_)."
  }

  return null
}
