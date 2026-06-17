import {
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react"
import { awsComponentsByKey } from "../utils/awsComponents"
import { createGroupForNode, deleteArchitectureNode, ungroupNode, type FlowNode } from "../utils/groupNode"
import {
  getHandleSideFromPoint,
  getHandleStyle,
  getSourceHandlePoint,
  getTargetHandlePoint,
  runHandleProgressAnimation,
} from "../utils/targetHandlePosition"

const HANDLE_POSITION = {
  left: Position.Left,
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
} as const

export interface ArchitectureNodeData extends Record<string, unknown> {
  componentKey: string;
  targetHandleAtTop?: boolean;
  sourceHandleAtBottom?: boolean;
}

export type ArchitectureNodeType = Node<ArchitectureNodeData, "architecture">;

const NODE_BORDER_RADIUS = 16

export const ArchitectureNode = ({ id, data, selected }: NodeProps<ArchitectureNodeType>) => {
  const { getNode, getInternalNode, setNodes } = useReactFlow<FlowNode>()
  const updateNodeInternals = useUpdateNodeInternals()
  const component = awsComponentsByKey[data.componentKey]
  const isGrouped = Boolean(getNode(id)?.parentId)

  const nodeBodyRef = useRef<HTMLDivElement>(null)
  const targetAnimationFrameRef = useRef<number | undefined>(undefined)
  const sourceAnimationFrameRef = useRef<number | undefined>(undefined)
  const targetProgressRef = useRef(data.targetHandleAtTop ? 1 : 0)
  const sourceProgressRef = useRef(data.sourceHandleAtBottom ? 1 : 0)

  const [targetProgress, setTargetProgress] = useState(data.targetHandleAtTop ? 1 : 0)
  const [sourceProgress, setSourceProgress] = useState(data.sourceHandleAtBottom ? 1 : 0)
  const [isTargetAnimating, setIsTargetAnimating] = useState(false)
  const [isSourceAnimating, setIsSourceAnimating] = useState(false)
  const [nodeSize, setNodeSize] = useState({ width: 320, height: 96 })

  useLayoutEffect(() => {
    const element = nodeBodyRef.current
    if (!element) {
      return
    }

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect()
      setNodeSize({ width, height })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(element)

    return () => observer.disconnect()
  }, [selected])

  useEffect(() => {
    updateNodeInternals(id)
  }, [targetProgress, sourceProgress, id, updateNodeInternals])

  useEffect(() => () => {
    if (targetAnimationFrameRef.current !== undefined) {
      cancelAnimationFrame(targetAnimationFrameRef.current)
    }
    if (sourceAnimationFrameRef.current !== undefined) {
      cancelAnimationFrame(sourceAnimationFrameRef.current)
    }
  }, [])

  const persistHandlePosition = useCallback((
    key: "targetHandleAtTop" | "sourceHandleAtBottom",
    value: boolean,
  ) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id && node.type === "architecture"
          ? { ...node, data: { ...node.data, [key]: value } }
          : node,
      ),
    )
  }, [id, setNodes])

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
    setNodes((nodes) => deleteArchitectureNode(nodes, id, getInternalNode))
  }

  return (
    <div className="relative">
      {selected && (
        <div className="nodrag nopan absolute right-0 bottom-full z-10 mb-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              disabled={isTargetAnimating}
              className="nodrag nopan flex items-center justify-center px-3 py-2 text-sm font-medium rounded-l-full
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2
          focus:ring-blue-700 focus:text-blue-700
            border border-slate-900 disabled:opacity-60
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900"
              onClick={handleTargetToggle}
              aria-label={targetProgress >= 0.5 ? "Mover entrada para esquerda" : "Mover entrada para cima"}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-none"
                style={{ transform: `rotate(${-90 * targetProgress}deg)` }}>
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <span className="w-0.5 justify-start items-center flex bg-slate-700" />
            <button type="button" className="px-4 py-2 text-sm font-medium
          hover:bg-gray-100 hover:dark:bg-slate-950  focus:z-10 focus:ring-2
          focus:ring-blue-700 focus:text-blue-700
            border-t border-b border-slate-900
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900">
              Details
            </button>
            <span className="w-0.5 justify-start items-center flex bg-slate-700" />
            <button type="button" className="nodrag nopan px-4 py-2 text-sm font-medium
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2
          focus:ring-blue-700 focus:text-blue-700
            border-t border-b border-slate-900
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900"
              onClick={handleGroupToggle}>
              {isGrouped ? "Ungroup" : "Group"}
            </button>
            <span className="w-0.5 justify-start items-center flex bg-slate-700" />
            <button type="button" className="nodrag nopan px-4 py-2 text-sm font-medium 
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2
          focus:ring-blue-700 focus:text-blue-700
            border border-slate-900
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900"
              onClick={handleDelete}>
              Delete
            </button>
            <span className="w-0.5 justify-start items-center flex bg-slate-700" />
            <button
              type="button"
              disabled={isSourceAnimating}
              className="nodrag nopan flex items-center justify-center px-3 py-2 text-sm font-medium rounded-r-full
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2
          focus:ring-blue-700 focus:text-blue-700
            border-t border-b border-slate-900 disabled:opacity-60
          dark:text-gray-200 text-gray-700 
          bg-white dark:bg-slate-900"
              onClick={handleSourceToggle}
              aria-label={sourceProgress >= 0.5 ? "Mover saída para direita" : "Mover saída para baixo"}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-none"
                style={{ transform: `rotate(${90 * sourceProgress}deg)` }}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

          </div >
        </div>
      )}

      <div
        ref={nodeBodyRef}
        className={`flex-col items-center gap-1 grid grid-flow-col
        rounded-2xl p-2 shadow-sm w-80
      bg-white dark:bg-slate-900
        border-2 border-slate-400 dark:border-slate-800
        ring-3 ring-slate-300 dark:ring-slate-950
      ${component.hoverCss}`}>
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
    </div>
  )
}
