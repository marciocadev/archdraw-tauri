import type { FlowNode } from "../components/utils/groupNode"
import { getSnsTopicConfig, type SnsTopicConfigInput } from "../components/utils/snsTopicTypes"
import type { DiagramResources, DiagramSnsTopic } from "./types"

function isSnsTopicNode(node: FlowNode): node is FlowNode & { type: "sns-topic" } {
  return node.type === "sns-topic" || node.data?.componentKey === "sns-topic"
}

function extractSnsTopics(nodes: FlowNode[]): DiagramSnsTopic[] {
  return nodes
    .filter(isSnsTopicNode)
    .map((node) => ({
      nodeId: node.id,
      ...getSnsTopicConfig(node.data as SnsTopicConfigInput),
    }))
}

export function extractDiagramResources(nodes: FlowNode[]): DiagramResources {
  return {
    snsTopics: extractSnsTopics(nodes),
  }
}
