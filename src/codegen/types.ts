import type { SnsTopicConfig } from "../components/utils/snsTopicTypes"

export type CodeGeneratorType = "terraform" | "aws-cdk"

export interface DiagramSnsTopic extends SnsTopicConfig {
  nodeId: string
}

export interface DiagramResources {
  snsTopics: DiagramSnsTopic[]
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
