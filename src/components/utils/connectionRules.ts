import type { Connection, Edge } from "@xyflow/react"
import { isAwsComponentNode } from "../nodes/aws/awsComponentNodeTypes"
import { awsComponentsByKey } from "./awsComponents"
import type { FlowNode } from "./groupNode"

const SQS_QUEUE_KEY = "sqs-queue"
const SQS_DLQ_KEY = "sqs-dlq"
const DLQ_SOURCE_HANDLE = "dlq"

function isSameConnection(
  edge: Edge,
  connection: Connection,
): boolean {
  return edge.source === connection.source
    && edge.target === connection.target
    && (edge.sourceHandle ?? null) === (connection.sourceHandle ?? null)
    && (edge.targetHandle ?? null) === (connection.targetHandle ?? null)
}

function isDlqToDeadLetterQueueConnection(
  sourceKey: string,
  targetKey: string,
  sourceHandle: string | null,
): boolean {
  return sourceKey === SQS_QUEUE_KEY
    && targetKey === SQS_DLQ_KEY
    && sourceHandle === DLQ_SOURCE_HANDLE
}

export function isValidArchitectureConnection(
  connection: Connection,
  nodes: FlowNode[],
  edges: Edge[] = [],
): boolean {
  const { source, target, sourceHandle = null } = connection

  if (!source || !target || source === target) {
    return false
  }

  const sourceNode = nodes.find((node) => node.id === source)
  const targetNode = nodes.find((node) => node.id === target)

  if (!isAwsComponentNode(sourceNode) || !isAwsComponentNode(targetNode)) {
    return false
  }

  const sourceKey = sourceNode.data.componentKey
  const targetKey = targetNode.data.componentKey
  const sourceComponent = awsComponentsByKey[sourceKey]
  const targetComponent = awsComponentsByKey[targetKey]

  if (!sourceComponent || !targetComponent) {
    return false
  }

  const isDlqConnection = isDlqToDeadLetterQueueConnection(sourceKey, targetKey, sourceHandle)

  if (sourceHandle === DLQ_SOURCE_HANDLE) {
    return isDlqConnection
      && !edges.some((edge) => isSameConnection(edge, connection))
  }

  if (targetKey === SQS_DLQ_KEY) {
    return false
  }

  const isAllowedByRules = sourceComponent.connections.canConnectTo.includes(targetKey)
    && targetComponent.connections.canReceiveFrom.includes(sourceKey)

  if (!isAllowedByRules) {
    return false
  }

  return !edges.some((edge) => isSameConnection(edge, connection))
}
