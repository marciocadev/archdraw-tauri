import type { TerraformContext } from "../buildTerraformContext"
import type { DiagramResources } from "../../types"
import { DEFAULT_MAX_RECEIVE_COUNT } from "../../../components/utils/dlqConnectionTypes"
import { escapeTerraformString } from "./escapeTerraformString"
import { renderSqsQueueSettingsAttributes } from "./renderSqsQueueSettings"

export function renderSqsDlqs(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.sqsDlqs.map((dlq, index) => {
    const identifiers = context.sqsDlqs[dlq.nodeId]
    const fallback = `dlq-${index + 1}`
    const queueName = dlq.dlqName.trim() || fallback
    const settings = renderSqsQueueSettingsAttributes(dlq)

    return `resource "aws_sqs_queue" "${identifiers.resourceName}" {
  name = "${escapeTerraformString(queueName)}"${settings}
}`
  }).join("\n\n")
}

export function renderSqsQueues(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.sqsQueues.map((queue, index) => {
    const identifiers = context.sqsQueues[queue.nodeId]
    const fallback = `queue-${index + 1}`
    const queueName = queue.queueName.trim() || fallback
    const settings = renderSqsQueueSettingsAttributes(queue)
    const dlqIdentifiers = queue.deadLetterQueueNodeId
      ? context.sqsDlqs[queue.deadLetterQueueNodeId]
      : undefined
    const redrivePolicy = dlqIdentifiers
      ? `\n  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.${dlqIdentifiers.resourceName}.arn
    maxReceiveCount     = ${queue.maxReceiveCount ?? DEFAULT_MAX_RECEIVE_COUNT}
  })`
      : ""

    return `resource "aws_sqs_queue" "${identifiers.resourceName}" {
  name = "${escapeTerraformString(queueName)}"${settings}${redrivePolicy}
}`
  }).join("\n\n")
}

export function renderSqsOutputs(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  const queueOutputs = resources.sqsQueues.map((queue, index) => {
    const identifiers = context.sqsQueues[queue.nodeId]
    return `output "${identifiers.resourceName}_arn" {
  description = "ARN of SQS queue ${queue.queueName || `queue-${index + 1}`}"
  value       = aws_sqs_queue.${identifiers.resourceName}.arn
}`
  })

  const dlqOutputs = resources.sqsDlqs.map((dlq, index) => {
    const identifiers = context.sqsDlqs[dlq.nodeId]
    return `output "${identifiers.resourceName}_arn" {
  description = "ARN of SQS DLQ ${dlq.dlqName || `dlq-${index + 1}`}"
  value       = aws_sqs_queue.${identifiers.resourceName}.arn
}`
  })

  return [...queueOutputs, ...dlqOutputs].join("\n\n")
}
