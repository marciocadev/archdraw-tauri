import type { ArchitectureEdgeType } from "../components/edges/ArchitectureEdge"
import type { FlowNode } from "../components/utils/groupNode"
import { getMaxReceiveCount } from "../components/utils/dlqConnectionTypes"
import { getMessageBodyFilters } from "../components/utils/messageBodyFilterTypes"
import { getRawMessageDelivery } from "../components/utils/snsSqsConnectionTypes"
import { getSnsTopicConfig, type SnsTopicConfigInput } from "../components/utils/snsTopicTypes"
import { getSqsDlqConfig, type SqsDlqConfigInput } from "../components/utils/sqsDlqTypes"
import { getSqsQueueConfig, type SqsQueueConfigInput } from "../components/utils/sqsQueueTypes"
import type {
  DiagramResources,
  DiagramSnsSqsSubscription,
  DiagramSnsTopic,
  DiagramSqsDlq,
  DiagramSqsQueue,
} from "./types"

const DLQ_SOURCE_HANDLE = "dlq"

interface DeadLetterQueueLink {
  dlqNodeId: string
  maxReceiveCount: number
}

function isSnsTopicNode(node: FlowNode): node is FlowNode & { type: "sns-topic" } {
  return node.type === "sns-topic" || node.data?.componentKey === "sns-topic"
}

function isSqsQueueNode(node: FlowNode): node is FlowNode & { type: "sqs-queue" } {
  return node.type === "sqs-queue" || node.data?.componentKey === "sqs-queue"
}

function isSqsDlqNode(node: FlowNode): node is FlowNode & { type: "sqs-dlq" } {
  return node.type === "sqs-dlq" || node.data?.componentKey === "sqs-dlq"
}

function extractDeadLetterQueueLinks(
  nodes: FlowNode[],
  edges: ArchitectureEdgeType[],
): Map<string, DeadLetterQueueLink> {
  const links = new Map<string, DeadLetterQueueLink>()
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  for (const edge of edges) {
    if (edge.sourceHandle !== DLQ_SOURCE_HANDLE) {
      continue
    }

    const sourceNode = nodeById.get(edge.source)
    const targetNode = nodeById.get(edge.target)

    if (!sourceNode || !targetNode) {
      continue
    }

    if (!isSqsQueueNode(sourceNode) || !isSqsDlqNode(targetNode)) {
      continue
    }

    links.set(sourceNode.id, {
      dlqNodeId: targetNode.id,
      maxReceiveCount: getMaxReceiveCount(edge.data?.maxReceiveCount),
    })
  }

  return links
}

function extractSnsTopics(nodes: FlowNode[]): DiagramSnsTopic[] {
  return nodes
    .filter(isSnsTopicNode)
    .map((node) => ({
      nodeId: node.id,
      ...getSnsTopicConfig(node.data as SnsTopicConfigInput),
    }))
}

function extractSqsQueues(
  nodes: FlowNode[],
  deadLetterQueueLinks: Map<string, DeadLetterQueueLink>,
): DiagramSqsQueue[] {
  return nodes
    .filter(isSqsQueueNode)
    .map((node) => {
      const dlqLink = deadLetterQueueLinks.get(node.id)

      return {
        nodeId: node.id,
        ...getSqsQueueConfig(node.data as SqsQueueConfigInput),
        deadLetterQueueNodeId: dlqLink?.dlqNodeId,
        maxReceiveCount: dlqLink?.maxReceiveCount,
      }
    })
}

function extractSqsDlqs(nodes: FlowNode[]): DiagramSqsDlq[] {
  return nodes
    .filter(isSqsDlqNode)
    .map((node) => ({
      nodeId: node.id,
      ...getSqsDlqConfig(node.data as SqsDlqConfigInput),
    }))
}

function extractSnsSqsSubscriptions(
  nodes: FlowNode[],
  edges: ArchitectureEdgeType[],
): DiagramSnsSqsSubscription[] {
  const subscriptions: DiagramSnsSqsSubscription[] = []
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  for (const edge of edges) {
    if (edge.sourceHandle === DLQ_SOURCE_HANDLE) {
      continue
    }

    const sourceNode = nodeById.get(edge.source)
    const targetNode = nodeById.get(edge.target)

    if (!sourceNode || !targetNode) {
      continue
    }

    if (!isSnsTopicNode(sourceNode) || !isSqsQueueNode(targetNode)) {
      continue
    }

    subscriptions.push({
      topicNodeId: sourceNode.id,
      queueNodeId: targetNode.id,
      rawMessageDelivery: getRawMessageDelivery(edge.data?.rawMessageDelivery),
      messageBodyFilters: getMessageBodyFilters(edge.data?.messageBodyFilters),
    })
  }

  return subscriptions
}

export function extractDiagramResources(
  nodes: FlowNode[],
  edges: ArchitectureEdgeType[] = [],
): DiagramResources {
  const deadLetterQueueLinks = extractDeadLetterQueueLinks(nodes, edges)

  return {
    snsTopics: extractSnsTopics(nodes),
    sqsQueues: extractSqsQueues(nodes, deadLetterQueueLinks),
    sqsDlqs: extractSqsDlqs(nodes),
    snsSqsSubscriptions: extractSnsSqsSubscriptions(nodes, edges),
  }
}
