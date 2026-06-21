import type { LambdaFunctionConfig } from "../components/utils/lambdaFunctionTypes"
import type { MessageBodyFilter } from "../components/utils/messageBodyFilterTypes"
import type { SnsTopicConfig } from "../components/utils/snsTopicTypes"
import type { SqsDlqConfig } from "../components/utils/sqsDlqTypes"
import type { SqsQueueConfig } from "../components/utils/sqsQueueTypes"

export type CodeGeneratorType = "terraform" | "aws-cdk"

export interface DiagramSnsTopic extends SnsTopicConfig {
  nodeId: string
}

export interface DiagramLambdaFunction extends LambdaFunctionConfig {
  nodeId: string
}

export interface DiagramSqsQueue extends SqsQueueConfig {
  nodeId: string
  deadLetterQueueNodeId?: string
  maxReceiveCount?: number
}

export interface DiagramSqsDlq extends SqsDlqConfig {
  nodeId: string
}

export interface DiagramSnsSqsSubscription {
  topicNodeId: string
  queueNodeId: string
  rawMessageDelivery: boolean
  messageBodyFilters: MessageBodyFilter[]
}

export interface DiagramSnsLambdaSubscription {
  topicNodeId: string
  lambdaNodeId: string
}

export interface DiagramSqsLambdaEventSource {
  queueNodeId: string
  lambdaNodeId: string
}

export interface DiagramResources {
  snsTopics: DiagramSnsTopic[]
  lambdaFunctions: DiagramLambdaFunction[]
  sqsQueues: DiagramSqsQueue[]
  sqsDlqs: DiagramSqsDlq[]
  snsSqsSubscriptions: DiagramSnsSqsSubscription[]
  snsLambdaSubscriptions: DiagramSnsLambdaSubscription[]
  sqsLambdaEventSources: DiagramSqsLambdaEventSource[]
}

export interface ProjectFile {
  relativePath: string
  content: string
}

export interface GenerateProjectInput {
  generatorType: CodeGeneratorType
  stackName: string
  resources: DiagramResources
}
