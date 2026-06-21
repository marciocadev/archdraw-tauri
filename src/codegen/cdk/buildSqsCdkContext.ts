import { toCamelCase, toPascalCase } from "../sanitizeNames"
import type { DiagramResources } from "../types"

export interface SqsCdkIdentifiers {
  variableName: string
  logicalId: string
  queueName: string
}

export interface SqsCdkContext {
  dlqs: Record<string, SqsCdkIdentifiers>
  queues: Record<string, SqsCdkIdentifiers>
}

export function buildSqsCdkContext(resources: DiagramResources): SqsCdkContext {
  const dlqs: Record<string, SqsCdkIdentifiers> = {}
  const queues: Record<string, SqsCdkIdentifiers> = {}

  resources.sqsDlqs.forEach((dlq, index) => {
    const fallback = `SqsDlq${index + 1}`
    dlqs[dlq.nodeId] = {
      variableName: toCamelCase(dlq.dlqName, fallback),
      logicalId: toPascalCase(dlq.dlqName, fallback),
      queueName: dlq.dlqName.trim() || fallback,
    }
  })

  resources.sqsQueues.forEach((queue, index) => {
    const fallback = `SqsQueue${index + 1}`
    queues[queue.nodeId] = {
      variableName: toCamelCase(queue.queueName, fallback),
      logicalId: toPascalCase(queue.queueName, fallback),
      queueName: queue.queueName.trim() || fallback,
    }
  })

  return { dlqs, queues }
}
