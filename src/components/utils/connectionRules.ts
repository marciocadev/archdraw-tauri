import type { Connection, Edge } from "@xyflow/react"
import type { ArchitectureNodeType } from "../nodes/ArchitectureNode"
import { awsComponentsByKey } from "./awsComponents"
import type { FlowNode } from "./groupNode"

function getArchitectureNode(
  nodes: FlowNode[],
  nodeId: string | null | undefined,
): ArchitectureNodeType | undefined {
  if (!nodeId) {
    return undefined
  }

  const node = nodes.find((current) => current.id === nodeId)
  if (!node || node.type !== "architecture") {
    return undefined
  }

  return node as ArchitectureNodeType;
}

export function isValidArchitectureConnection(
  connection: Connection,
  nodes: FlowNode[],
  edges: Edge[] = [],
): boolean {
  const { source, target } = connection

  if (!source || !target || source === target) {
    return false
  }

  const sourceNode = getArchitectureNode(nodes, source)
  const targetNode = getArchitectureNode(nodes, target)

  if (!sourceNode || !targetNode) {
    return false
  }

  const sourceKey = sourceNode.data.componentKey
  const targetKey = targetNode.data.componentKey
  const sourceComponent = awsComponentsByKey[sourceKey]
  const targetComponent = awsComponentsByKey[targetKey]

  if (!sourceComponent || !targetComponent) {
    return false
  }

  const isAllowedByRules = sourceComponent.connections.canConnectTo.includes(targetKey)
    && targetComponent.connections.canReceiveFrom.includes(sourceKey)

  if (!isAllowedByRules) {
    return false
  }

  const isDuplicate = edges.some((edge) => edge.source === source && edge.target === target)

  return !isDuplicate
}
