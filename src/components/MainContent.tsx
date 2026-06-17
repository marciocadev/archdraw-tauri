import {
  addEdge,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type ColorMode,
  type Connection,
  type IsValidConnection,
  type NodeChange,
  type OnNodeDrag,
} from "@xyflow/react"
import { useCallback, useMemo, useRef, useState, type DragEvent, type MouseEvent } from "react";
import { ConnectionConfigPanel } from "./ConnectionConfigPanel";
import { ArchitectureEdge, type ArchitectureEdgeData, type ArchitectureEdgeType } from "./edges/ArchitectureEdge";
import { ArchitectureNode, type ArchitectureNodeType } from "./nodes/ArchitectureNode";
import { GroupNode } from "./nodes/GroupNode";
import { awsComponentsByKey, DND_MIME_TYPE } from "./utils/awsComponents";
import { isValidArchitectureConnection } from "./utils/connectionRules";
import {
  DEFAULT_CONNECTION_PATH_TYPE,
  type ConnectionDraft,
} from "./utils/connectionTypes";
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

const edgeTypes = {
  architecture: ArchitectureEdge,
}

const defaultEdgeOptions = {
  type: "architecture" as const,
  animated: true,
  style: { strokeWidth: 2 },
}

function generateNodeId(): string {
  return `node_${crypto.randomUUID()}`;
}

function getConnectionDraft(edge: ArchitectureEdgeType | undefined): ConnectionDraft {
  return {
    label: edge?.data?.label ?? "",
    pathType: edge?.data?.pathType ?? DEFAULT_CONNECTION_PATH_TYPE,
  }
}

export interface MainContentProps {
  colorMode: ColorMode
}

const MainContentFlow = (props: MainContentProps) => {
  const [nodes, setNodes] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchitectureEdgeType>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const edgeSnapshotRef = useRef<{ id: string; data: ArchitectureEdgeData } | null>(null);
  const { screenToFlowPosition, getInternalNode, getIntersectingNodes } = useReactFlow<FlowNode>();

  const { colorMode } = props

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId),
    [edges, selectedEdgeId],
  )

  const connectionDraft = useMemo(
    () => getConnectionDraft(selectedEdge),
    [selectedEdge],
  )

  const isValidConnection = useCallback<IsValidConnection<ArchitectureEdgeType>>(
    (connection) => {
      if (!connection.source || !connection.target) {
        return false
      }

      return isValidArchitectureConnection(
        {
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle ?? null,
          targetHandle: connection.targetHandle ?? null,
        },
        nodes,
        edges,
      )
    },
    [edges, nodes],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidArchitectureConnection(connection, nodes, edges)) {
        return
      }

      setEdges((currentEdges) => addEdge({
        ...connection,
        type: "architecture",
        animated: true,
        style: { strokeWidth: 2 },
        data: {
          label: "",
          labelPosition: 0.5,
          pathType: DEFAULT_CONNECTION_PATH_TYPE,
        },
      }, currentEdges))
    },
    [edges, nodes, setEdges],
  )

  const clearEdgeSelection = useCallback(() => {
    setSelectedEdgeId(null)
    edgeSnapshotRef.current = null
    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        selected: false,
      })),
    )
  }, [setEdges])

  const onEdgeClick = useCallback((_event: MouseEvent, edge: ArchitectureEdgeType) => {
    edgeSnapshotRef.current = {
      id: edge.id,
      data: {
        label: edge.data?.label ?? "",
        labelPosition: edge.data?.labelPosition ?? 0.5,
        pathType: edge.data?.pathType ?? DEFAULT_CONNECTION_PATH_TYPE,
      },
    }
    setSelectedEdgeId(edge.id)
    setEdges((currentEdges) =>
      currentEdges.map((currentEdge) => ({
        ...currentEdge,
        selected: currentEdge.id === edge.id,
      })),
    )
  }, [setEdges])

  const handleCancelConnectionPanel = useCallback(() => {
    const snapshot = edgeSnapshotRef.current
    if (snapshot) {
      setEdges((currentEdges) =>
        currentEdges.map((edge) =>
          edge.id === snapshot.id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  ...snapshot.data,
                },
              }
            : edge,
        ),
      )
    }

    clearEdgeSelection()
  }, [clearEdgeSelection, setEdges])

  const handleConfirmConnectionPanel = useCallback((draft: ConnectionDraft) => {
    if (!selectedEdgeId) {
      return
    }

    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              data: {
                ...edge.data,
                label: draft.label,
                pathType: draft.pathType,
              },
            }
          : edge,
      ),
    )

    clearEdgeSelection()
  }, [clearEdgeSelection, selectedEdgeId, setEdges])

  const handleNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    setNodes((currentNodes) => {
      let nextNodes = applyNodeChanges(changes, currentNodes) as FlowNode[]

      const dragChange = changes.find(
        (change) => change.type === "position" && change.dragging && change.position,
      )

      if (!dragChange || dragChange.type !== "position" || !dragChange.position) {
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

  const onPaneClick = useCallback(() => {
    if (selectedEdgeId) {
      handleCancelConnectionPanel()
    }
  }, [handleCancelConnectionPanel, selectedEdgeId])

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
    <div className="relative h-full w-full dark:bg-slate-700 bg-slate-50">
      <ConnectionConfigPanel
        isOpen={selectedEdgeId !== null}
        initialDraft={connectionDraft}
        onConfirm={handleConfirmConnectionPanel}
        onCancel={handleCancelConnectionPanel}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
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
