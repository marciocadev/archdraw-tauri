import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
} from "@xyflow/react"
import { useCallback, useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react"
import { getComponentBorderColor } from "../utils/awsComponents"
import { useDocumentColorMode } from "../utils/colorMode"
import type { FlowNode } from "../utils/groupNode"
import { isAwsComponentNode } from "../nodes/aws/awsComponentNodeTypes"
import {
  DEFAULT_CONNECTION_PATH_TYPE,
  type ConnectionPathType,
} from "../utils/connectionTypes"
import { getClosestPositionOnPath, getPointOnEdgePath } from "../utils/edgePath"

export interface ArchitectureEdgeData extends Record<string, unknown> {
  label?: string;
  labelPosition?: number;
  pathType?: ConnectionPathType;
}

export type ArchitectureEdgeType = Edge<ArchitectureEdgeData, "architecture">

const DEFAULT_LABEL_POSITION = 0.5

function getEdgePath(
  pathType: ConnectionPathType,
  params: {
    sourceX: number;
    sourceY: number;
    sourcePosition: EdgeProps["sourcePosition"];
    targetX: number;
    targetY: number;
    targetPosition: EdgeProps["targetPosition"];
  },
): string {
  switch (pathType) {
    case "smoothstep":
      return getSmoothStepPath(params)[0]
    case "step":
      return getSmoothStepPath({ ...params, borderRadius: 0 })[0]
    case "straight":
      return getStraightPath(params)[0]
    default:
      return getBezierPath(params)[0]
  }
}

function getGradientId(edgeId: string): string {
  return `edge-gradient-${edgeId.replace(/[^a-zA-Z0-9-_]/g, "")}`
}

function getComponentKey(node: FlowNode | undefined): string | undefined {
  if (!isAwsComponentNode(node)) {
    return undefined
  }

  if (typeof node.data.componentKey !== "string") {
    return undefined
  }

  return node.data.componentKey
}

export const ArchitectureEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
  interactionWidth,
}: EdgeProps<ArchitectureEdgeType>) => {
  const { getNode, screenToFlowPosition, setEdges } = useReactFlow<FlowNode>()
  const colorMode = useDocumentColorMode()
  const isDraggingLabelRef = useRef(false)

  const pathParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourcePosition, sourceX, sourceY, targetPosition, targetX, targetY])

  const pathType = data?.pathType ?? DEFAULT_CONNECTION_PATH_TYPE
  const edgePath = useMemo(
    () => getEdgePath(pathType, pathParams),
    [pathParams, pathType],
  )

  const sourceNode = getNode(source)
  const targetNode = getNode(target)
  const sourceColor = getComponentBorderColor(getComponentKey(sourceNode), colorMode)
  const targetColor = getComponentBorderColor(getComponentKey(targetNode), colorMode)
  const gradientId = getGradientId(id)

  const label = data?.label ?? ""
  const showLabel = label.trim().length > 0
  const labelPosition = data?.labelPosition ?? DEFAULT_LABEL_POSITION
  const labelPoint = getPointOnEdgePath(edgePath, labelPosition)

  const updateLabelPosition = useCallback((nextPosition: number) => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? {
            ...edge,
            data: {
              ...edge.data,
              labelPosition: nextPosition,
            },
          }
          : edge,
      ),
    )
  }, [id, setEdges])

  const handleLabelPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    isDraggingLabelRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handleLabelPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingLabelRef.current) {
      return
    }

    event.stopPropagation()
    const flowPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })
    const nextPosition = getClosestPositionOnPath(edgePath, flowPosition.x, flowPosition.y)
    updateLabelPosition(nextPosition)
  }, [edgePath, screenToFlowPosition, updateLabelPosition])

  const handleLabelPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingLabelRef.current) {
      return
    }

    isDraggingLabelRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}>
          <stop offset="0%" stopColor={sourceColor} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: `url(#${gradientId})`,
          strokeWidth: 2,
          ...style,
        }}
        interactionWidth={interactionWidth}
        className={selected ? "react-flow__edge-selected" : undefined} />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto absolute max-w-48 cursor-grab whitespace-pre-wrap
              rounded-md border border-slate-400 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm
              active:cursor-grabbing dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            style={{
              transform: `translate(-50%, -50%) translate(${labelPoint.x}px, ${labelPoint.y}px)`,
            }}
            onPointerDown={handleLabelPointerDown}
            onPointerMove={handleLabelPointerMove}
            onPointerUp={handleLabelPointerUp}>
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
