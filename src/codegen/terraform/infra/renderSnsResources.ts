import type { TerraformContext } from "../buildTerraformContext"
import type { DiagramResources } from "../../types"
import { escapeTerraformString } from "./escapeTerraformString"

function resolveTopicName(topicName: string, topicType: "standard" | "fifo", fallback: string): string {
  const trimmed = topicName.trim()
  return trimmed || (topicType === "fifo" ? `${fallback}.fifo` : fallback)
}

export function renderSnsTopics(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.snsTopics.map((topic, index) => {
    const identifiers = context.snsTopics[topic.nodeId]
    const fallback = `topic-${index + 1}`
    const topicName = resolveTopicName(topic.topicName, topic.topicType, fallback)
    const fifoLine = topic.topicType === "fifo" ? "\n  fifo_topic = true" : ""

    return `resource "aws_sns_topic" "${identifiers.resourceName}" {
  name = "${escapeTerraformString(topicName)}"${fifoLine}
}`
  }).join("\n\n")
}

export function renderSnsTopicOutputs(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.snsTopics.map((topic, index) => {
    const identifiers = context.snsTopics[topic.nodeId]
    const outputName = `${identifiers.resourceName}_arn`

    return `output "${outputName}" {
  description = "ARN of SNS topic ${topic.topicName || `topic-${index + 1}`}"
  value       = aws_sns_topic.${identifiers.resourceName}.arn
}`
  }).join("\n\n")
}
