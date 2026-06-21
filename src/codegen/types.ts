import type { SnsTopicConfig } from "../components/utils/snsTopicTypes"
import type { SqsDlqConfig } from "../components/utils/sqsDlqTypes"
import type { SqsQueueConfig } from "../components/utils/sqsQueueTypes"

export type CodeGeneratorType = "terraform" | "aws-cdk"

export interface DiagramSnsTopic extends SnsTopicConfig {
  nodeId: string
}

export interface DiagramSqsQueue extends SqsQueueConfig {
  nodeId: string
}

export interface DiagramSqsDlq extends SqsDlqConfig {
  nodeId: string
}

export interface DiagramResources {
  snsTopics: DiagramSnsTopic[]
  sqsQueues: DiagramSqsQueue[]
  sqsDlqs: DiagramSqsDlq[]
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
