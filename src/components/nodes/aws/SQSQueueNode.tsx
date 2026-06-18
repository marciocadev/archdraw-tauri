import { Handle, Position, useReactFlow, useUpdateNodeInternals, type NodeProps } from "@xyflow/react"
import type { SQSQueueNodeType } from "./awsComponentNodeTypes"
import { createGroupForNode, deleteAwsComponentNode, ungroupNode, type FlowNode } from "../../utils/groupNode"
import { awsComponentsByKey } from "../../utils/awsComponents"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react"
import { getDlqHandlePoint, getHandleSideFromPoint, getHandleStyle, getSourceHandlePoint, getTargetHandlePoint, runHandleProgressAnimation } from "../../utils/targetHandlePosition"
import { MenuNode } from "../MenuNode"

export type { SQSQueueNodeType } from "./awsComponentNodeTypes"

const COMPONENT_KEY = "sqs-queue"
const NODE_TYPE = "sqs-queue" as const

const HANDLE_POSITION = {
  left: Position.Left,
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
} as const

const NODE_BORDER_RADIUS = 16

const DLQ_ARROW_BUTTON_CLASS = `nodrag nopan flex items-center justify-center px-2 py-1 text-sm font-medium
  hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2
  focus:ring-blue-700 focus:text-blue-700
  border-slate-900 disabled:opacity-60 disabled:pointer-events-none
  dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900`

interface DlqBounds {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

function getDlqHandlePosition(
  dlqProgress: number,
  dlqBounds: DlqBounds,
) {
  const localPoint = getDlqHandlePoint(dlqProgress, dlqBounds.width, dlqBounds.height)
  const point = {
    x: dlqBounds.offsetX + localPoint.x,
    y: dlqBounds.offsetY + localPoint.y,
  }
  const side = getHandleSideFromPoint(localPoint, dlqBounds.width, dlqBounds.height)

  return { point, side }
}

export const SQSQueueNode = ({ id, data, selected }: NodeProps<SQSQueueNodeType>) => {
  const { getNode, getInternalNode, setNodes, setEdges } = useReactFlow<FlowNode>()
  const updateNodeInternals = useUpdateNodeInternals()
  const component = awsComponentsByKey[COMPONENT_KEY]
  const isGrouped = Boolean(getNode(id)?.parentId)

  const haveTarget = Boolean(component?.haveTarget)
  const haveSource = Boolean(component?.haveSource)

  const nodeBodyRef = useRef<HTMLDivElement>(null)
  const dlqRef = useRef<HTMLDivElement>(null)
  const dlqAnimationFrameRef = useRef<number | undefined>(undefined)
  const dlqProgressRef = useRef(data.dlqHandleAtRight !== false ? 1 : 0)
  const targetAnimationFrameRef = useRef<number | undefined>(undefined)
  const sourceAnimationFrameRef = useRef<number | undefined>(undefined)
  const targetProgressRef = useRef(data.targetHandleAtTop ? 1 : 0)
  const sourceProgressRef = useRef(data.sourceHandleAtBottom ? 1 : 0)

  const [targetProgress, setTargetProgress] = useState(data.targetHandleAtTop ? 1 : 0)
  const [sourceProgress, setSourceProgress] = useState(data.sourceHandleAtBottom ? 1 : 0)
  const [isTargetAnimating, setIsTargetAnimating] = useState(false)
  const [isSourceAnimating, setIsSourceAnimating] = useState(false)
  const [isDlqAnimating, setIsDlqAnimating] = useState(false)
  const [dlqProgress, setDlqProgress] = useState(data.dlqHandleAtRight !== false ? 1 : 0)
  const [nodeSize, setNodeSize] = useState({ width: 320, height: 96 })
  const [dlqBounds, setDlqBounds] = useState<DlqBounds | null>(null)

  useLayoutEffect(() => {
    const element = nodeBodyRef.current
    if (!element) {
      return
    }

    const updateLayout = () => {
      const nodeRect = element.getBoundingClientRect()
      setNodeSize({ width: nodeRect.width, height: nodeRect.height })

      const dlqElement = dlqRef.current
      if (!dlqElement) {
        setDlqBounds(null)
        return
      }

      const dlqRect = dlqElement.getBoundingClientRect()
      setDlqBounds({
        offsetX: dlqRect.left - nodeRect.left,
        offsetY: dlqRect.top - nodeRect.top,
        width: dlqRect.width,
        height: dlqRect.height,
      })
    }

    updateLayout()

    const observer = new ResizeObserver(() => {
      updateLayout()
      updateNodeInternals(id)
    })
    observer.observe(element)
    if (dlqRef.current) {
      observer.observe(dlqRef.current)
    }

    return () => observer.disconnect()
  }, [id, selected, updateNodeInternals])

  useEffect(() => {
    updateNodeInternals(id)
  }, [targetProgress, sourceProgress, dlqProgress, dlqBounds, id, updateNodeInternals])

  useEffect(() => () => {
    if (targetAnimationFrameRef.current !== undefined) {
      cancelAnimationFrame(targetAnimationFrameRef.current)
    }
    if (sourceAnimationFrameRef.current !== undefined) {
      cancelAnimationFrame(sourceAnimationFrameRef.current)
    }
    if (dlqAnimationFrameRef.current !== undefined) {
      cancelAnimationFrame(dlqAnimationFrameRef.current)
    }
  }, [])

  const persistHandlePosition = useCallback((
    key: "targetHandleAtTop" | "sourceHandleAtBottom",
    value: boolean,
  ) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id && node.type === NODE_TYPE
          ? { ...node, data: { ...node.data, [key]: value } }
          : node,
      ),
    )
  }, [id, NODE_TYPE, setNodes])

  const handleTargetToggle = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (isTargetAnimating) {
      return
    }

    setIsTargetAnimating(true)

    runHandleProgressAnimation({
      startProgress: targetProgressRef.current,
      animationFrameRef: targetAnimationFrameRef,
      onProgress: (progress) => {
        targetProgressRef.current = progress
        setTargetProgress(progress)
        updateNodeInternals(id)
      },
      onComplete: (endProgress) => {
        targetProgressRef.current = endProgress
        setTargetProgress(endProgress)
        setIsTargetAnimating(false)
        persistHandlePosition("targetHandleAtTop", endProgress === 1)
        updateNodeInternals(id)
      },
    })
  }, [id, isTargetAnimating, persistHandlePosition, updateNodeInternals])

  const handleSourceToggle = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (isSourceAnimating) {
      return
    }

    setIsSourceAnimating(true)

    runHandleProgressAnimation({
      startProgress: sourceProgressRef.current,
      animationFrameRef: sourceAnimationFrameRef,
      onProgress: (progress) => {
        sourceProgressRef.current = progress
        setSourceProgress(progress)
        updateNodeInternals(id)
      },
      onComplete: (endProgress) => {
        sourceProgressRef.current = endProgress
        setSourceProgress(endProgress)
        setIsSourceAnimating(false)
        persistHandlePosition("sourceHandleAtBottom", endProgress === 1)
        updateNodeInternals(id)
      },
    })
  }, [id, isSourceAnimating, persistHandlePosition, updateNodeInternals])

  const persistDlqHandlePosition = useCallback((atRight: boolean) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id && node.type === NODE_TYPE
          ? { ...node, data: { ...node.data, dlqHandleAtRight: atRight } }
          : node,
      ),
    )
  }, [id, setNodes])

  const runDlqHandleAnimation = useCallback((endProgress: number) => {
    if (isDlqAnimating || dlqProgressRef.current === endProgress) {
      return
    }

    setIsDlqAnimating(true)

    runHandleProgressAnimation({
      startProgress: dlqProgressRef.current,
      endProgress,
      animationFrameRef: dlqAnimationFrameRef,
      onProgress: (progress) => {
        dlqProgressRef.current = progress
        setDlqProgress(progress)
        updateNodeInternals(id)
      },
      onComplete: (completedProgress) => {
        dlqProgressRef.current = completedProgress
        setDlqProgress(completedProgress)
        setIsDlqAnimating(false)
        persistDlqHandlePosition(completedProgress === 1)
        updateNodeInternals(id)
      },
    })
  }, [id, isDlqAnimating, persistDlqHandlePosition, updateNodeInternals])

  const handleDlqToggle = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    runDlqHandleAnimation(dlqProgressRef.current >= 0.5 ? 0 : 1)
  }, [runDlqHandleAnimation])

  if (!component) {
    return null
  }

  const Svg = component.svg
  const targetPoint = getTargetHandlePoint(
    targetProgress,
    nodeSize.width,
    nodeSize.height,
    NODE_BORDER_RADIUS,
  )
  const sourcePoint = getSourceHandlePoint(
    sourceProgress,
    nodeSize.width,
    nodeSize.height,
    NODE_BORDER_RADIUS,
  )
  const targetSide = getHandleSideFromPoint(targetPoint, nodeSize.width, nodeSize.height)
  const sourceSide = getHandleSideFromPoint(sourcePoint, nodeSize.width, nodeSize.height)

  const dlqHandle = dlqBounds
    ? getDlqHandlePosition(dlqProgress, dlqBounds)
    : null
  const dlqArrowRotation = 180 * (1 + dlqProgress)

  const handleGroupToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (isGrouped) {
      setNodes((nodes) => ungroupNode(nodes, id, getInternalNode))
      return
    }

    const internalNode = getInternalNode(id)
    const dimensions = internalNode
      ? {
        width: internalNode.measured.width ?? internalNode.width ?? 320,
        height: internalNode.measured.height ?? internalNode.height ?? 96,
        absoluteX: internalNode.internals.positionAbsolute.x,
        absoluteY: internalNode.internals.positionAbsolute.y,
      }
      : undefined

    setNodes((nodes) => createGroupForNode(nodes, id, dimensions))
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setNodes((nodes) => deleteAwsComponentNode(nodes, id, getInternalNode))
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    )
  }

  return (
    <div className="relative overflow-visible">
      {selected && (
        <MenuNode
          haveTarget={haveTarget}
          isTargetAnimating={isTargetAnimating}
          targetProgress={targetProgress}
          handleTargetToggle={handleTargetToggle}
          haveSource={haveSource}
          handleGroupToggle={handleGroupToggle}
          handleDelete={handleDelete}
          handleSourceToggle={handleSourceToggle}
          isSourceAnimating={isSourceAnimating}
          sourceProgress={sourceProgress}
          isGrouped={isGrouped}
        />
      )}

      <div
        ref={nodeBodyRef}
        className={`relative overflow-visible flex-col items-center gap-1 grid grid-cols-1
        rounded-2xl p-2 shadow-sm w-80
      bg-white dark:bg-slate-900
        border-2 border-slate-400 dark:border-slate-800
        ring-3 ring-slate-300 dark:ring-slate-950
      ${component.hoverCss}`}>
        <div className="rows-span-1 grid grid-flow-col">
          <Handle
            type="target"
            position={HANDLE_POSITION[targetSide]}
            className="size-4! bg-inherit! border-2! border-neutral-400!"
            style={getHandleStyle(targetPoint, nodeSize.width, nodeSize.height)} />
          <Handle
            type="source"
            position={HANDLE_POSITION[sourceSide]}
            className="size-4! bg-inherit! border-2! border-neutral-400!"
            style={getHandleStyle(sourcePoint, nodeSize.width, nodeSize.height)} />
          <div className="flex flex-col items-start justify-start p-2 text-gray-500">
            <div className="text-sm font-[AmazonEmberBold]">
              {component.type}
            </div>
            <div className="text-xl font-[AmazonEmberHeavy] dark:text-gray-200 text-gray-700">
              {component.component}
            </div>
          </div>
          <div className="flex flex-col items-end justify-start p-2">
            <Svg />
          </div>
        </div>
        <div className="px-2 pb-2">
          <div
            ref={dlqRef}
            className="grid grid-cols-[1fr_auto] items-center gap-2 p-2 border-2 border-slate-500 rounded-full">
            <div className="px-3 text-start">
              <div className="text-sm font-[AmazonEmberBold] text-gray-500">DLQ</div>
            </div>
            <button
              type="button"
              disabled={isDlqAnimating}
              className={`${DLQ_ARROW_BUTTON_CLASS} rounded-full border border-slate-900`}
              onClick={handleDlqToggle}
              aria-label={dlqProgress >= 0.5 ? "Mover handle DLQ para esquerda" : "Mover handle DLQ para direita"}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-none"
                style={{ transform: `rotate(${dlqArrowRotation}deg)` }}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
        {dlqHandle && (
          <Handle
            id="dlq"
            type="source"
            position={HANDLE_POSITION[dlqHandle.side]}
            className="z-10 size-4! bg-inherit! border-2! border-neutral-400!"
            style={getHandleStyle(dlqHandle.point, nodeSize.width, nodeSize.height)}
          />
        )}
      </div>
    </div>
  )
}
