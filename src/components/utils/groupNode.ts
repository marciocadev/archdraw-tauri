import type { CSSProperties } from "react"
import type { InternalNode } from "@xyflow/react"
import type { ArchitectureNodeType } from "../nodes/ArchitectureNode"
import type { GroupNodeType } from "../nodes/GroupNode"

export type { GroupNodeType } from "../nodes/GroupNode"
export type FlowNode = ArchitectureNodeType | GroupNodeType

export const GROUP_CHILD_PADDING = 24
export const MIN_GROUP_WIDTH = 200
export const MIN_GROUP_HEIGHT = 150
export const GROUP_Z_INDEX = 0
export const ARCHITECTURE_Z_INDEX = 1

const DEFAULT_NODE_WIDTH = 320
const DEFAULT_NODE_HEIGHT = 96

export const GROUP_NODE_STYLE: CSSProperties = {
  borderRadius: 32,
}

export interface GroupNodeDimensions {
  width: number;
  height: number;
  absoluteX: number;
  absoluteY: number;
}

interface ChildRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function readStyleSize(value: number | string | undefined, fallback: number): number {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return fallback
}

function getGroupArea(group: GroupNodeType): number {
  return readStyleSize(group.style?.width, MIN_GROUP_WIDTH)
    * readStyleSize(group.style?.height, MIN_GROUP_HEIGHT)
}

export function getNodeAbsolutePosition(
  nodeId: string,
  nodes: FlowNode[],
): { x: number; y: number } | undefined {
  const node = nodes.find((current) => current.id === nodeId)
  if (!node) {
    return undefined
  }

  if (!node.parentId) {
    return { x: node.position.x, y: node.position.y }
  }

  const parentAbsolute = getNodeAbsolutePosition(node.parentId, nodes)
  if (!parentAbsolute) {
    return undefined
  }

  return {
    x: parentAbsolute.x + node.position.x,
    y: parentAbsolute.y + node.position.y,
  }
}

function getAbsolutePosition(
  nodeId: string,
  nodes: FlowNode[],
  getInternalNode: (id: string) => InternalNode | undefined,
): { x: number; y: number } | undefined {
  const fromNodes = getNodeAbsolutePosition(nodeId, nodes)
  if (fromNodes) {
    return fromNodes
  }

  const internalNode = getInternalNode(nodeId)
  if (!internalNode) {
    return undefined
  }

  return {
    x: internalNode.internals.positionAbsolute.x,
    y: internalNode.internals.positionAbsolute.y,
  }
}

function getChildRect(
  child: ArchitectureNodeType,
  nodes: FlowNode[],
  getInternalNode: (id: string) => InternalNode | undefined,
  draggedNode?: { id: string; position: { x: number; y: number } },
): ChildRect | undefined {
  const internalNode = getInternalNode(child.id)
  const width = internalNode?.measured.width
    ?? internalNode?.width
    ?? DEFAULT_NODE_WIDTH
  const height = internalNode?.measured.height
    ?? internalNode?.height
    ?? DEFAULT_NODE_HEIGHT

  if (draggedNode?.id === child.id) {
    const groupAbsolute = child.parentId
      ? getNodeAbsolutePosition(child.parentId, nodes)
      : undefined

    if (!groupAbsolute) {
      return undefined
    }

    return {
      id: child.id,
      x: groupAbsolute.x + draggedNode.position.x,
      y: groupAbsolute.y + draggedNode.position.y,
      width,
      height,
    }
  }

  const absolutePosition = getNodeAbsolutePosition(child.id, nodes)
  if (!absolutePosition) {
    return undefined
  }

  return {
    id: child.id,
    x: absolutePosition.x,
    y: absolutePosition.y,
    width,
    height,
  }
}

function sortNodesByParentChild(nodes: FlowNode[]): FlowNode[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const sorted: FlowNode[] = []
  const visited = new Set<string>()

  const visit = (node: FlowNode) => {
    if (visited.has(node.id)) {
      return
    }

    if (node.parentId) {
      const parent = nodeById.get(node.parentId)
      if (parent) {
        visit(parent)
      }
    }

    visited.add(node.id)
    sorted.push(node)
  }

  for (const node of nodes) {
    visit(node)
  }

  return sorted
}

function ensureNodeZIndex(node: FlowNode): FlowNode {
  const zIndex = node.type === "group" ? GROUP_Z_INDEX : ARCHITECTURE_Z_INDEX
  return node.zIndex === zIndex ? node : { ...node, zIndex }
}

export function normalizeNodes(nodes: FlowNode[]): FlowNode[] {
  return sortNodesByParentChild(nodes.map(ensureNodeZIndex))
}

function asGroupChild(
  node: ArchitectureNodeType,
  parentId: string,
  position: { x: number; y: number },
): ArchitectureNodeType {
  return {
    ...node,
    parentId,
    position,
    zIndex: ARCHITECTURE_Z_INDEX,
  }
}

function detachFromGroup(
  node: ArchitectureNodeType,
  absolutePosition: { x: number; y: number },
): ArchitectureNodeType {
  return {
    ...node,
    parentId: undefined,
    extent: undefined,
    expandParent: undefined,
    position: absolutePosition,
  }
}

function fitSingleGroup(
  nodes: FlowNode[],
  groupId: string,
  getInternalNode: (id: string) => InternalNode | undefined,
  draggedNode?: { id: string; position: { x: number; y: number } },
): FlowNode[] {
  const group = nodes.find((node) => node.id === groupId && node.type === "group")
  if (!group) {
    return nodes
  }

  const children = nodes.filter(
    (node) => node.parentId === groupId && node.type === "architecture",
  ) as ArchitectureNodeType[]

  if (children.length === 0) {
    return nodes
  }

  const childRects = children
    .map((child) => getChildRect(child, nodes, getInternalNode, draggedNode))
    .filter((rect): rect is ChildRect => rect !== undefined)

  if (childRects.length === 0) {
    return nodes
  }

  const minX = Math.min(...childRects.map((rect) => rect.x))
  const minY = Math.min(...childRects.map((rect) => rect.y))
  const maxX = Math.max(...childRects.map((rect) => rect.x + rect.width))
  const maxY = Math.max(...childRects.map((rect) => rect.y + rect.height))

  const groupX = minX - GROUP_CHILD_PADDING
  const groupY = minY - GROUP_CHILD_PADDING
  const groupWidth = maxX - minX + GROUP_CHILD_PADDING * 2
  const groupHeight = maxY - minY + GROUP_CHILD_PADDING * 2
  const groupPositionChanged = group.position.x !== groupX || group.position.y !== groupY

  return nodes.map((node) => {
    if (node.id === groupId && node.type === "group") {
      return {
        ...node,
        position: { x: groupX, y: groupY },
        style: {
          ...node.style,
          ...GROUP_NODE_STYLE,
          width: groupWidth,
          height: groupHeight,
        },
      }
    }

    if (node.parentId !== groupId || node.type !== "architecture") {
      return node
    }

    if (!groupPositionChanged) {
      return node
    }

    const childRect = childRects.find((rect) => rect.id === node.id)
    if (!childRect) {
      return node
    }

    return {
      ...node,
      position: {
        x: childRect.x - groupX,
        y: childRect.y - groupY,
      },
    }
  })
}

export function fitGroupsToChildren(
  nodes: FlowNode[],
  getInternalNode: (id: string) => InternalNode | undefined,
  groupIds?: string[],
  draggedNode?: { id: string; position: { x: number; y: number } },
): FlowNode[] {
  const targetGroupIds = groupIds
    ?? nodes.filter((node) => node.type === "group").map((node) => node.id)

  const fittedNodes = targetGroupIds.reduce(
    (currentNodes, groupId) => fitSingleGroup(
      currentNodes,
      groupId,
      getInternalNode,
      draggedNode?.id && currentNodes.some(
        (node) => node.id === draggedNode.id && node.parentId === groupId,
      )
        ? draggedNode
        : undefined,
    ),
    nodes,
  )

  return normalizeNodes(fittedNodes)
}

export function ungroupNode(
  nodes: FlowNode[],
  nodeId: string,
  getInternalNode: (id: string) => InternalNode | undefined,
): FlowNode[] {
  const node = nodes.find((current) => current.id === nodeId)

  if (!node || node.type !== "architecture" || !node.parentId) {
    return nodes
  }

  const parentId = node.parentId
  const absolutePosition = getAbsolutePosition(nodeId, nodes, getInternalNode)

  if (!absolutePosition) {
    return nodes
  }

  let updatedNodes = nodes.map((current) =>
    current.id === nodeId
      ? detachFromGroup(current as ArchitectureNodeType, absolutePosition)
      : current,
  )

  const hasOtherChildren = updatedNodes.some((current) => current.parentId === parentId)

  if (!hasOtherChildren) {
    return normalizeNodes(updatedNodes.filter((current) => current.id !== parentId))
  }

  return fitGroupsToChildren(updatedNodes, getInternalNode, [parentId])
}

export function deleteArchitectureNode(
  nodes: FlowNode[],
  nodeId: string,
  getInternalNode: (id: string) => InternalNode | undefined,
): FlowNode[] {
  const node = nodes.find((current) => current.id === nodeId)

  if (!node || node.type !== "architecture") {
    return nodes
  }

  const parentId = node.parentId
  const updatedNodes = nodes.filter((current) => current.id !== nodeId)

  if (!parentId) {
    return normalizeNodes(updatedNodes)
  }

  const hasOtherChildren = updatedNodes.some((current) => current.parentId === parentId)

  if (!hasOtherChildren) {
    return normalizeNodes(updatedNodes.filter((current) => current.id !== parentId))
  }

  return fitGroupsToChildren(updatedNodes, getInternalNode, [parentId])
}

export function findTargetGroupForPoint(
  nodes: FlowNode[],
  point: { x: number; y: number },
  _getInternalNode: (id: string) => InternalNode | undefined,
): GroupNodeType | undefined {
  return nodes
    .filter((node): node is GroupNodeType => node.type === "group")
    .filter((group) => {
      const groupAbsolute = getNodeAbsolutePosition(group.id, nodes)
      if (!groupAbsolute) {
        return false
      }

      const width = readStyleSize(group.style?.width, MIN_GROUP_WIDTH)
      const height = readStyleSize(group.style?.height, MIN_GROUP_HEIGHT)

      return (
        point.x >= groupAbsolute.x
        && point.x <= groupAbsolute.x + width
        && point.y >= groupAbsolute.y
        && point.y <= groupAbsolute.y + height
      )
    })
    .sort((a, b) => getGroupArea(a) - getGroupArea(b))[0]
}

export function resolveGroupMembership(
  nodes: FlowNode[],
  nodeId: string,
  getInternalNode: (id: string) => InternalNode | undefined,
  getIntersectingNodes: (node: { id: string }, partially?: boolean) => FlowNode[],
): FlowNode[] {
  const node = nodes.find((current) => current.id === nodeId)
  if (!node || node.type !== "architecture") {
    return nodes
  }

  const absolutePosition = getAbsolutePosition(nodeId, nodes, getInternalNode)
  if (!absolutePosition) {
    return nodes
  }

  const targetGroup = getIntersectingNodes(node)
    .filter((current): current is GroupNodeType => current.type === "group")
    .sort((a, b) => getGroupArea(a) - getGroupArea(b))[0]

  if (targetGroup) {
    if (node.parentId === targetGroup.id) {
      return fitGroupsToChildren(nodes, getInternalNode, [targetGroup.id])
    }

    const groupAbsolute = getNodeAbsolutePosition(targetGroup.id, nodes)
    if (!groupAbsolute) {
      return nodes
    }

    const updatedNodes = nodes.map((current) => {
      if (current.id !== nodeId) {
        return current
      }

      return asGroupChild(
        current as ArchitectureNodeType,
        targetGroup.id,
        {
          x: absolutePosition.x - groupAbsolute.x,
          y: absolutePosition.y - groupAbsolute.y,
        },
      )
    })

    return fitGroupsToChildren(updatedNodes, getInternalNode, [targetGroup.id])
  }

  if (!node.parentId) {
    return nodes
  }

  const parentId = node.parentId

  let updatedNodes = nodes.map((current) => {
    if (current.id !== nodeId) {
      return current
    }

    return detachFromGroup(current as ArchitectureNodeType, absolutePosition)
  })

  const hasOtherChildren = updatedNodes.some((current) => current.parentId === parentId)

  if (!hasOtherChildren) {
    return normalizeNodes(updatedNodes.filter((current) => current.id !== parentId))
  }

  return fitGroupsToChildren(updatedNodes, getInternalNode, [parentId])
}

export function attachNodeToGroup(
  node: ArchitectureNodeType,
  group: GroupNodeType,
  absolutePosition: { x: number; y: number },
  groupAbsolutePosition: { x: number; y: number },
): ArchitectureNodeType {
  return asGroupChild(node, group.id, {
    x: absolutePosition.x - groupAbsolutePosition.x,
    y: absolutePosition.y - groupAbsolutePosition.y,
  })
}

export function createGroupForNode(
  nodes: FlowNode[],
  nodeId: string,
  dimensions?: GroupNodeDimensions,
): FlowNode[] {
  const child = nodes.find((node) => node.id === nodeId)

  if (!child || child.type !== "architecture" || child.parentId) {
    return nodes
  }

  const width = dimensions?.width ?? DEFAULT_NODE_WIDTH
  const height = dimensions?.height ?? DEFAULT_NODE_HEIGHT
  const absoluteX = dimensions?.absoluteX ?? child.position.x
  const absoluteY = dimensions?.absoluteY ?? child.position.y

  const groupId = `group_${crypto.randomUUID()}`
  const groupPosition = {
    x: absoluteX - GROUP_CHILD_PADDING,
    y: absoluteY - GROUP_CHILD_PADDING,
  }

  const groupNode: GroupNodeType = {
    id: groupId,
    type: "group",
    position: groupPosition,
    selectable: true,
    zIndex: GROUP_Z_INDEX,
    style: {
      ...GROUP_NODE_STYLE,
      width: width + GROUP_CHILD_PADDING * 2,
      height: height + GROUP_CHILD_PADDING * 2,
    },
    data: {},
  }

  const updatedChild = asGroupChild(
    child as ArchitectureNodeType,
    groupId,
    {
      x: GROUP_CHILD_PADDING,
      y: GROUP_CHILD_PADDING,
    },
  )

  const withoutChild = nodes.filter((node) => node.id !== nodeId)
  return normalizeNodes([...withoutChild, groupNode, updatedChild])
}
