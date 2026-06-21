import { toCamelCase, toPascalCase } from "../sanitizeNames"
import type { DiagramResources } from "../types"

export interface SnsCdkIdentifiers {
  variableName: string
  logicalId: string
  topicName: string
}

export interface SnsCdkContext {
  topics: Record<string, SnsCdkIdentifiers>
}

export function buildSnsCdkContext(resources: DiagramResources): SnsCdkContext {
  const topics: Record<string, SnsCdkIdentifiers> = {}

  resources.snsTopics.forEach((topic, index) => {
    const fallback = `SnsTopic${index + 1}`
    topics[topic.nodeId] = {
      variableName: toCamelCase(topic.topicName, fallback),
      logicalId: toPascalCase(topic.topicName, fallback),
      topicName: topic.topicName.trim() || fallback,
    }
  })

  return { topics }
}
