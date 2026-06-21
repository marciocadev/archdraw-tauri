import type { FlowNode } from "../components/utils/groupNode"
import { getSnsTopicConfig, type SnsTopicConfigInput } from "../components/utils/snsTopicTypes"
import { getSqsDlqConfig, type SqsDlqConfigInput } from "../components/utils/sqsDlqTypes"
import { getSqsQueueConfig, type SqsQueueConfigInput } from "../components/utils/sqsQueueTypes"
import type {
  DiagramResources,
  DiagramSnsTopic,
  DiagramSqsDlq,
  DiagramSqsQueue,
} from "./types"

function isSnsTopicNode(node: FlowNode): node is FlowNode & { type: "sns-topic" } {
  return node.type === "sns-topic" || node.data?.componentKey === "sns-topic"
}

function isSqsQueueNode(node: FlowNode): node is FlowNode & { type: "sqs-queue" } {
  return node.type === "sqs-queue" || node.data?.componentKey === "sqs-queue"
}

function isSqsDlqNode(node: FlowNode): node is FlowNode & { type: "sqs-dlq" } {
  return node.type === "sqs-dlq" || node.data?.componentKey === "sqs-dlq"
}

function extractSnsTopics(nodes: FlowNode[]): DiagramSnsTopic[] {
  return nodes
    .filter(isSnsTopicNode)
    .map((node) => ({
      nodeId: node.id,
      ...getSnsTopicConfig(node.data as SnsTopicConfigInput),
    }))
}

function extractSqsQueues(nodes: FlowNode[]): DiagramSqsQueue[] {
  return nodes
    .filter(isSqsQueueNode)
    .map((node) => ({
      nodeId: node.id,
      ...getSqsQueueConfig(node.data as SqsQueueConfigInput),
    }))
}

function extractSqsDlqs(nodes: FlowNode[]): DiagramSqsDlq[] {
  return nodes
    .filter(isSqsDlqNode)
    .map((node) => ({
      nodeId: node.id,
      ...getSqsDlqConfig(node.data as SqsDlqConfigInput),
    }))
}

export function extractDiagramResources(nodes: FlowNode[]): DiagramResources {
  return {
    snsTopics: extractSnsTopics(nodes),
    sqsQueues: extractSqsQueues(nodes),
    sqsDlqs: extractSqsDlqs(nodes),
  }
}
