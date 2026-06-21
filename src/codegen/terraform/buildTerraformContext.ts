import { toTerraformResourceName } from "../sanitizeNames"
import type { DiagramResources } from "../types"

export interface TerraformIdentifiers {
  resourceName: string
  displayName: string
}

export interface TerraformContext {
  snsTopics: Record<string, TerraformIdentifiers>
  lambdaFunctions: Record<string, TerraformIdentifiers>
  sqsQueues: Record<string, TerraformIdentifiers>
  sqsDlqs: Record<string, TerraformIdentifiers>
}

export function buildTerraformContext(resources: DiagramResources): TerraformContext {
  const snsTopics: Record<string, TerraformIdentifiers> = {}
  const lambdaFunctions: Record<string, TerraformIdentifiers> = {}
  const sqsQueues: Record<string, TerraformIdentifiers> = {}
  const sqsDlqs: Record<string, TerraformIdentifiers> = {}

  resources.snsTopics.forEach((topic, index) => {
    const fallback = `sns_topic_${index + 1}`
    snsTopics[topic.nodeId] = {
      resourceName: toTerraformResourceName(topic.topicName, fallback),
      displayName: topic.topicName.trim() || fallback,
    }
  })

  resources.lambdaFunctions.forEach((lambdaFunction, index) => {
    const fallback = `lambda_function_${index + 1}`
    lambdaFunctions[lambdaFunction.nodeId] = {
      resourceName: toTerraformResourceName(lambdaFunction.functionName, fallback),
      displayName: lambdaFunction.functionName.trim() || fallback,
    }
  })

  resources.sqsQueues.forEach((queue, index) => {
    const fallback = `sqs_queue_${index + 1}`
    sqsQueues[queue.nodeId] = {
      resourceName: toTerraformResourceName(queue.queueName, fallback),
      displayName: queue.queueName.trim() || fallback,
    }
  })

  resources.sqsDlqs.forEach((dlq, index) => {
    const fallback = `sqs_dlq_${index + 1}`
    sqsDlqs[dlq.nodeId] = {
      resourceName: toTerraformResourceName(dlq.dlqName, fallback),
      displayName: dlq.dlqName.trim() || fallback,
    }
  })

  return { snsTopics, lambdaFunctions, sqsQueues, sqsDlqs }
}
