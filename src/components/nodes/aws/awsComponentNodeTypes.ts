import type { Node } from "@xyflow/react"
import type { SnsTopicType } from "../../utils/snsTopicTypes"

export const AWS_COMPONENT_NODE_TYPES = ["lambda-function", "sns-topic", "sqs-queue", "sqs-dlq"] as const

export type AwsComponentNodeTypeName = (typeof AWS_COMPONENT_NODE_TYPES)[number]

export interface AwsComponentNodeData extends Record<string, unknown> {
  componentKey: string;
  targetHandleAtTop?: boolean;
  sourceHandleAtBottom?: boolean;
  dlqHandleAtRight?: boolean;
  topicName?: string;
  topicType?: SnsTopicType;
  functionName?: string;
  queueName?: string;
  dlqName?: string;
}

export type LambdaFunctionNodeType = Node<AwsComponentNodeData, "lambda-function">
export type SNSTopicNodeType = Node<AwsComponentNodeData, "sns-topic">
export type SQSQueueNodeType = Node<AwsComponentNodeData, "sqs-queue">
export type SQSDeadLetterQueueNodeType = Node<AwsComponentNodeData, "sqs-dlq">
export type AwsComponentNodeType = LambdaFunctionNodeType | SNSTopicNodeType | SQSQueueNodeType | SQSDeadLetterQueueNodeType

export function isAwsComponentNodeType(
  type: string | undefined,
): type is AwsComponentNodeTypeName {
  return AWS_COMPONENT_NODE_TYPES.includes(type as AwsComponentNodeTypeName)
}

export function isAwsComponentNode(
  node: { type?: string } | undefined,
): node is AwsComponentNodeType {
  return isAwsComponentNodeType(node?.type)
}
