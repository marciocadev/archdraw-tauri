import {
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react"
import { awsComponentsByKey } from "../../utils/awsComponents"
import { createGroupForNode, deleteAwsComponentNode, ungroupNode, type FlowNode } from "../../utils/groupNode"
import {
  getHandleSideFromPoint,
  getHandleStyle,
  getSourceHandlePoint,
  getTargetHandlePoint,
  runHandleProgressAnimation,
} from "../../utils/targetHandlePosition"
import { MenuNode } from "../MenuNode"
import { useComponentConfig } from "../../../contexts/ComponentConfigContext"
import {
  type AwsComponentNodeData,
  type AwsComponentNodeTypeName,
} from "./awsComponentNodeTypes"

const HANDLE_POSITION = {
  left: Position.Left,
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
} as const

const NODE_BORDER_RADIUS = 16

export interface AwsComponentNodeBaseProps {
  id: string;
  data: AwsComponentNodeData;
  selected: boolean;
  nodeType: AwsComponentNodeTypeName;
  componentKey: string;
  componentLabel?: string;
}

export const AwsComponentNodeBase = ({
  id,
  data,
  selected,
  nodeType,
  componentKey,
  componentLabel,
}: AwsComponentNodeBaseProps) => {
  const { openConfig } = useComponentConfig()
  const { getNode, getInternalNode, setNodes, setEdges } = useReactFlow<FlowNode>()
  const updateNodeInternals = useUpdateNodeInternals()
  const component = awsComponentsByKey[componentKey]
  const isGrouped = Boolean(getNode(id)?.parentId)

  const haveTarget = Boolean(component?.haveTarget)
  const haveSource = Boolean(component?.haveSource)

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
        node.id === id && node.type === nodeType
          ? { ...node, data: { ...node.data, [key]: value } }
          : node,
      ),
    )
  }, [id, nodeType, setNodes])

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
    setNodes((nodes) => deleteAwsComponentNode(nodes, id, getInternalNode))
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    )
  }

  const handleSettings = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    openConfig(id)
  }, [id, openConfig])

  return (
    <div className="relative">
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
          handleSettings={handleSettings}
        />
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
            {componentLabel ?? component.component}
          </div>
        </div>
        <div className="flex flex-col items-end justify-start p-2">
          <Svg />
        </div>
      </div>
    </div>
  )
}
