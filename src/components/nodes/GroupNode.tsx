import type { Node } from "@xyflow/react"

export interface GroupNodeData extends Record<string, unknown> {
  label?: string;
}

export type GroupNodeType = Node<GroupNodeData, "group">

export const GroupNode = () => null
