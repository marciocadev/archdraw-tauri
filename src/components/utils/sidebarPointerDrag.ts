export interface SidebarPointerDrop {
  componentKey: string
  clientX: number
  clientY: number
}

type SidebarPointerDropListener = (drop: SidebarPointerDrop) => void

const DRAG_THRESHOLD_PX = 4

let listeners: SidebarPointerDropListener[] = []

export function subscribeSidebarPointerDrop(
  listener: SidebarPointerDropListener,
): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((current) => current !== listener)
  }
}

export function emitSidebarPointerDrop(drop: SidebarPointerDrop): void {
  for (const listener of listeners) {
    listener(drop)
  }
}

export function isReactFlowPaneTarget(target: Element | null): boolean {
  return target?.closest(".react-flow__pane") != null
}

export function startSidebarPointerDrag(
  componentKey: string,
  startX: number,
  startY: number,
): void {
  let isDragging = false

  const handlePointerMove = (event: PointerEvent) => {
    const deltaX = Math.abs(event.clientX - startX)
    const deltaY = Math.abs(event.clientY - startY)

    if (deltaX > DRAG_THRESHOLD_PX || deltaY > DRAG_THRESHOLD_PX) {
      isDragging = true
    }
  }

  const handlePointerUp = (event: PointerEvent) => {
    document.removeEventListener("pointermove", handlePointerMove)
    document.removeEventListener("pointerup", handlePointerUp)

    if (!isDragging) {
      return
    }

    const target = document.elementFromPoint(event.clientX, event.clientY)
    if (!isReactFlowPaneTarget(target)) {
      return
    }

    emitSidebarPointerDrop({
      componentKey,
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  document.addEventListener("pointermove", handlePointerMove)
  document.addEventListener("pointerup", handlePointerUp)
}
