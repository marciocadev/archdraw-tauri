import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type ColorMode,
  type NodeChange,
  type OnNodeDrag,
} from "@xyflow/react"
import { useCallback, useMemo, type DragEvent } from "react";
import { ArchitectureNode, type ArchitectureNodeType } from "./nodes/ArchitectureNode";
import { GroupNode } from "./nodes/GroupNode";
import { awsComponentsByKey, DND_MIME_TYPE } from "./utils/awsComponents";
import {
  ARCHITECTURE_Z_INDEX,
  attachNodeToGroup,
  findTargetGroupForPoint,
  fitGroupsToChildren,
  getNodeAbsolutePosition,
  normalizeNodes,
  resolveGroupMembership,
  type FlowNode,
} from "./utils/groupNode";

const nodeTypes = {
  architecture: ArchitectureNode,
  group: GroupNode,
}

function generateNodeId(): string {
  return `node_${crypto.randomUUID()}`;
}

export interface MainContentProps {
  colorMode: ColorMode
}

const MainContentFlow = (props: MainContentProps) => {
  const [nodes, setNodes] = useNodesState<FlowNode>([]);
  const { screenToFlowPosition, getInternalNode, getIntersectingNodes } = useReactFlow<FlowNode>();

  const { colorMode } = props

  const handleNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    setNodes((currentNodes) => {
      let nextNodes = applyNodeChanges(changes, currentNodes) as FlowNode[]

      const dragChange = changes.find(
        (change) => change.type === "position" && change.dragging && change.position,
      )

      if (!dragChange || dragChange.type !== "position") {
        return nextNodes
      }

      const draggedNode = nextNodes.find((node) => node.id === dragChange.id)
      if (draggedNode?.type !== "architecture" || !draggedNode.parentId) {
        return nextNodes
      }

      return fitGroupsToChildren(
        nextNodes,
        getInternalNode,
        [draggedNode.parentId],
        { id: draggedNode.id, position: dragChange.position },
      )
    })
  }, [getInternalNode, setNodes])

  const onNodeDragStop = useCallback<OnNodeDrag<FlowNode>>((_event, node) => {
    if (node.type !== "architecture") {
      return
    }

    setNodes((currentNodes) =>
      resolveGroupMembership(currentNodes, node.id, getInternalNode, getIntersectingNodes),
    )
  }, [getInternalNode, getIntersectingNodes, setNodes])

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const componentKey = event.dataTransfer.getData(DND_MIME_TYPE)
    const component = awsComponentsByKey[componentKey]

    if (!component) {
      return
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode: ArchitectureNodeType = {
      id: generateNodeId(),
      type: "architecture",
      position,
      zIndex: ARCHITECTURE_Z_INDEX,
      data: { componentKey },
    }

    setNodes((prev) => {
      const targetGroup = findTargetGroupForPoint(prev, position, getInternalNode)
      if (!targetGroup) {
        return normalizeNodes([...prev, newNode])
      }

      const groupAbsolute = getNodeAbsolutePosition(targetGroup.id, prev)
      if (!groupAbsolute) {
        return normalizeNodes([...prev, newNode])
      }

      return fitGroupsToChildren(
        [
          ...prev,
          attachNodeToGroup(
            newNode,
            targetGroup,
            position,
            groupAbsolute,
          ),
        ],
        getInternalNode,
        [targetGroup.id],
      )
    })
  }, [getInternalNode, screenToFlowPosition, setNodes])

  const flowProps = useMemo(() => ({ hideAttribution: true as const }), [])

  return (
    <div className="h-full w-full dark:bg-slate-700 bg-slate-50">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDrop={onDrop}
        colorMode={colorMode}
        proOptions={flowProps}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export const MainContent = (props: MainContentProps) => (
  <ReactFlowProvider>
    <MainContentFlow {...props} />
  </ReactFlowProvider>
)
