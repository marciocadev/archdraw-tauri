import type { Node } from "@xyflow/react"
import type {
  LambdaArchitecture,
  LambdaEnvironmentVariable,
  LambdaLanguage,
  LambdaRuntime,
  LambdaTimeoutUnit,
} from "../../utils/lambdaFunctionTypes"
import type { SnsTopicType } from "../../utils/snsTopicTypes"
import type { VisibilityTimeoutUnit, DeliveryDelayUnit, MessageRetentionUnit } from "../../utils/sqsQueueTypes"

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
  runtime?: LambdaRuntime;
  architecture?: LambdaArchitecture;
  language?: LambdaLanguage;
  memoryMb?: number;
  ephemeralStorageMb?: number;
  timeoutValue?: number;
  timeoutUnit?: LambdaTimeoutUnit;
  environmentVariables?: LambdaEnvironmentVariable[];
  queueName?: string;
  visibilityTimeoutValue?: number;
  visibilityTimeoutUnit?: VisibilityTimeoutUnit;
  deliveryDelayValue?: number;
  deliveryDelayUnit?: DeliveryDelayUnit;
  receiveMessageWaitTime?: number;
  messageRetentionValue?: number;
  messageRetentionUnit?: MessageRetentionUnit;
  maximumMessageSizeKib?: number;
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
