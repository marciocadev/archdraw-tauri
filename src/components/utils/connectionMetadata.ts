import type { Connection } from "@xyflow/react"
import type { ArchitectureEdgeType } from "../edges/ArchitectureEdge"
import type { FlowNode } from "./groupNode"

const SNS_TOPIC_KEY = "sns-topic"
const SQS_QUEUE_KEY = "sqs-queue"
const DLQ_SOURCE_HANDLE = "dlq"

function isSnsTopicToSqsQueueNodes(sourceNode: FlowNode | undefined, targetNode: FlowNode | undefined): boolean {
  return sourceNode?.data?.componentKey === SNS_TOPIC_KEY
    && targetNode?.data?.componentKey === SQS_QUEUE_KEY
}

export function isSnsToSqsConnection(
  connection: Pick<Connection, "source" | "target"> & { sourceHandle?: string | null },
  nodes: FlowNode[],
): boolean {
  if (connection.sourceHandle === DLQ_SOURCE_HANDLE) {
    return false
  }

  const sourceNode = nodes.find((node) => node.id === connection.source)
  const targetNode = nodes.find((node) => node.id === connection.target)

  return isSnsTopicToSqsQueueNodes(sourceNode, targetNode)
}

export function isSnsToSqsConnectionEdge(
  edge: ArchitectureEdgeType | undefined,
  nodes: FlowNode[],
): boolean {
  if (!edge) {
    return false
  }

  return isSnsToSqsConnection(edge, nodes)
}
