import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
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
import { ConnectionConfigPanel } from "./ConnectionConfigPanel";
import { ComponentConfigPanels } from "./ComponentConfigPanels";
import { ComponentConfigProvider } from "../contexts/ComponentConfigContext";
import { ArchitectureEdge, type ArchitectureEdgeData, type ArchitectureEdgeType } from "./edges/ArchitectureEdge";
import { LambdaFunctionNode } from "./nodes/aws/LambdaFunctionNode";
import { SNSTopicNode } from "./nodes/aws/SNSTopicNode";
import type { AwsComponentNodeData, AwsComponentNodeType } from "./nodes/aws/awsComponentNodeTypes";
import { isAwsComponentNode } from "./nodes/aws/awsComponentNodeTypes";
import { GroupNode } from "./nodes/GroupNode";
import { awsComponentsByKey, getNodeTypeForComponentKey } from "./utils/awsComponents";
import { subscribeSidebarPointerDrop } from "./utils/sidebarPointerDrag";
import { isValidArchitectureConnection } from "./utils/connectionRules";
import {
  DEFAULT_CONNECTION_PATH_TYPE,
  type ConnectionDraft,
} from "./utils/connectionTypes";
import {
  type SnsTopicConfig,
} from "./utils/snsTopicTypes";
import {
  type LambdaFunctionConfig,
} from "./utils/lambdaFunctionTypes";
import {
  type SqsQueueConfig,
} from "./utils/sqsQueueTypes";
import {
  type SqsDlqConfig,
} from "./utils/sqsDlqTypes";
import {
  ARCHITECTURE_Z_INDEX,
  attachNodeToGroup,
  DLQ_EDGE_Z_INDEX,
  findTargetGroupForPoint,
  fitGroupsToChildren,
  getNodeAbsolutePosition,
  normalizeNodes,
  resolveGroupMembership,
  type FlowNode,
} from "./utils/groupNode";
import { SQSQueueNode } from "./nodes/aws/SQSQueueNode";
import { SQSDeadLetterQueueNode } from "./nodes/aws/SQSDeadLetterQueueNode";
import { saveDiagramFromCanvas } from "../services/saveDiagramFile";
import { openDiagramFromFile } from "../services/openDiagramFile";

const nodeTypes = {
  "lambda-function": LambdaFunctionNode,
  "sns-topic": SNSTopicNode,
  "sqs-queue": SQSQueueNode,
  "sqs-dlq": SQSDeadLetterQueueNode,
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

export interface DiagramCanvasHandle {
  saveDiagram: () => Promise<boolean>
  openDiagram: () => Promise<boolean>
}

const MainContentFlow = forwardRef<DiagramCanvasHandle, MainContentProps>((props, ref) => {
  const [nodes, setNodes] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchitectureEdgeType>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [configuringNodeId, setConfiguringNodeId] = useState<string | null>(null);
  const edgeSnapshotRef = useRef<{ id: string; data: ArchitectureEdgeData } | null>(null);
  const componentConfigSnapshotRef = useRef<{ nodeId: string; data: AwsComponentNodeData } | null>(null);
  const { screenToFlowPosition, getInternalNode, getIntersectingNodes } = useReactFlow<FlowNode>();

  const { colorMode } = props

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  useImperativeHandle(ref, () => ({
    saveDiagram: async () => {
      return saveDiagramFromCanvas(nodesRef.current, edgesRef.current)
    },
    openDiagram: async () => {
      const document = await openDiagramFromFile()
      if (!document) {
        return false
      }

      setSelectedEdgeId(null)
      edgeSnapshotRef.current = null
      setConfiguringNodeId(null)
      componentConfigSnapshotRef.current = null
      setNodes(normalizeNodes(document.nodes))
      setEdges(document.edges.map((edge) => ({ ...edge, selected: false })))
      return true
    },
  }), [setEdges, setNodes])

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId),
    [edges, selectedEdgeId],
  )

  const connectionDraft = useMemo(
    () => getConnectionDraft(selectedEdge),
    [selectedEdge],
  )

  const configuringNode = useMemo(() => {
    const node = nodes.find((currentNode) => currentNode.id === configuringNodeId)
    return node && isAwsComponentNode(node) ? node : undefined
  }, [configuringNodeId, nodes])

  const isComponentConfigOpen = configuringNodeId !== null

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
        zIndex: connection.sourceHandle === "dlq" ? DLQ_EDGE_Z_INDEX : undefined,
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

  const clearComponentConfig = useCallback(() => {
    setConfiguringNodeId(null)
    componentConfigSnapshotRef.current = null
  }, [])

  const handleCancelComponentConfig = useCallback(() => {
    const snapshot = componentConfigSnapshotRef.current
    if (snapshot) {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === snapshot.nodeId && isAwsComponentNode(node)
            ? {
              ...node,
              data: { ...snapshot.data },
            }
            : node,
        ),
      )
    }

    clearComponentConfig()
  }, [clearComponentConfig, setNodes])

  const openComponentConfig = useCallback((nodeId: string) => {
    const node = nodesRef.current.find((currentNode) => currentNode.id === nodeId)
    if (!node || !isAwsComponentNode(node)) {
      return
    }

    componentConfigSnapshotRef.current = {
      nodeId,
      data: { ...node.data },
    }
    setConfiguringNodeId(nodeId)
  }, [])

  const onEdgeClick = useCallback((_event: MouseEvent, edge: ArchitectureEdgeType) => {
    if (configuringNodeId) {
      handleCancelComponentConfig()
    }

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
  }, [configuringNodeId, handleCancelComponentConfig, setEdges])

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

  const updateConfiguringNodeData = useCallback((
    updates: Partial<AwsComponentNodeData>,
  ) => {
    if (!configuringNodeId) {
      return
    }

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === configuringNodeId && isAwsComponentNode(node)
          ? {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          }
          : node,
      ),
    )

    clearComponentConfig()
  }, [clearComponentConfig, configuringNodeId, setNodes])

  const handleConfirmLambdaConfig = useCallback((config: LambdaFunctionConfig) => {
    updateConfiguringNodeData({ functionName: config.functionName })
  }, [updateConfiguringNodeData])

  const handleConfirmSnsConfig = useCallback((config: SnsTopicConfig) => {
    updateConfiguringNodeData({
      topicName: config.topicName,
      topicType: config.topicType,
    })
  }, [updateConfiguringNodeData])

  const handleConfirmSqsQueueConfig = useCallback((config: SqsQueueConfig) => {
    updateConfiguringNodeData({ queueName: config.queueName })
  }, [updateConfiguringNodeData])

  const handleConfirmSqsDlqConfig = useCallback((config: SqsDlqConfig) => {
    updateConfiguringNodeData({ dlqName: config.dlqName })
  }, [updateConfiguringNodeData])

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

  const handleDisconnectConnection = useCallback(() => {
    if (!selectedEdgeId) {
      return
    }

    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== selectedEdgeId))
    clearEdgeSelection()
  }, [clearEdgeSelection, selectedEdgeId, setEdges])

  const handleNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    setNodes((currentNodes) => {
      let nextNodes = normalizeNodes(applyNodeChanges(changes, currentNodes) as FlowNode[])

      const dragChange = changes.find(
        (change) => change.type === "position" && change.dragging && change.position,
      )

      if (!dragChange || dragChange.type !== "position" || !dragChange.position) {
        return nextNodes
      }

      const draggedNode = nextNodes.find((node) => node.id === dragChange.id)
      if (!isAwsComponentNode(draggedNode) || !draggedNode.parentId) {
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
    if (!isAwsComponentNode(node)) {
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
    if (configuringNodeId) {
      handleCancelComponentConfig()
    }
  }, [configuringNodeId, handleCancelComponentConfig, handleCancelConnectionPanel, selectedEdgeId])

  const addComponentAtPosition = useCallback((componentKey: string, clientX: number, clientY: number) => {
    const component = awsComponentsByKey[componentKey]

    if (!component) {
      return
    }

    const position = screenToFlowPosition({
      x: clientX,
      y: clientY,
    })

    const nodeType = getNodeTypeForComponentKey(componentKey)
    if (!nodeType) {
      return
    }

    const newNode: AwsComponentNodeType = {
      id: generateNodeId(),
      type: nodeType,
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

  useEffect(() => {
    return subscribeSidebarPointerDrop(({ componentKey, clientX, clientY }) => {
      addComponentAtPosition(componentKey, clientX, clientY)
    })
  }, [addComponentAtPosition])

  const componentConfigContextValue = useMemo(
    () => ({
      openConfig: (nodeId: string) => {
        if (selectedEdgeId) {
          handleCancelConnectionPanel()
        }
        openComponentConfig(nodeId)
      },
    }),
    [handleCancelConnectionPanel, openComponentConfig, selectedEdgeId],
  )

  const flowProps = useMemo(() => ({ hideAttribution: true as const }), [])

  return (
    <ComponentConfigProvider value={componentConfigContextValue}>
      <div className="relative h-full w-full dark:bg-slate-700 bg-slate-50">
        <ConnectionConfigPanel
          isOpen={selectedEdgeId !== null}
          initialDraft={connectionDraft}
          onConfirm={handleConfirmConnectionPanel}
          onCancel={handleCancelConnectionPanel}
          onDisconnect={handleDisconnectConnection}
        />
        <ComponentConfigPanels
          configuringNode={configuringNode}
          isOpen={isComponentConfigOpen}
          onCancel={handleCancelComponentConfig}
          onConfirmLambda={handleConfirmLambdaConfig}
          onConfirmSns={handleConfirmSnsConfig}
          onConfirmSqsQueue={handleConfirmSqsQueueConfig}
          onConfirmSqsDlq={handleConfirmSqsDlqConfig}
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
        colorMode={colorMode}
        proOptions={flowProps}>
        <Background />
        <Controls />
      </ReactFlow>
      </div>
    </ComponentConfigProvider>
  )
})

MainContentFlow.displayName = "MainContentFlow"

export const MainContent = forwardRef<DiagramCanvasHandle, MainContentProps>((props, ref) => (
  <ReactFlowProvider>
    <MainContentFlow ref={ref} {...props} />
  </ReactFlowProvider>
))

MainContent.displayName = "MainContent"
