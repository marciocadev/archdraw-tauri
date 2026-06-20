const ANIMATION_DURATION_MS = 2000

export { ANIMATION_DURATION_MS }

export function runHandleProgressAnimation(options: {
  startProgress: number;
  endProgress?: number;
  animationFrameRef: { current: number | undefined };
  onProgress: (progress: number) => void;
  onComplete: (endProgress: number) => void;
}): void {
  const endProgress = options.endProgress ?? (options.startProgress < 0.5 ? 1 : 0)
  const startTime = performance.now()

  const animate = (timestamp: number) => {
    const elapsed = timestamp - startTime
    const linearProgress = Math.min(elapsed / ANIMATION_DURATION_MS, 1)
    const currentProgress = options.startProgress + (endProgress - options.startProgress) * linearProgress

    options.onProgress(currentProgress)

    if (linearProgress < 1) {
      options.animationFrameRef.current = requestAnimationFrame(animate)
      return
    }

    options.onComplete(endProgress)
  }

  if (options.animationFrameRef.current !== undefined) {
    cancelAnimationFrame(options.animationFrameRef.current)
  }

  options.animationFrameRef.current = requestAnimationFrame(animate)
}

export function getTargetHandlePoint(
  progress: number,
  width: number,
  height: number,
  radius: number,
): { x: number; y: number } {
  if (progress <= 0) {
    return { x: 0, y: height / 2 }
  }

  if (progress >= 1) {
    return { x: width / 2, y: 0 }
  }

  const leftEdgeLength = height / 2 - radius
  const cornerLength = (Math.PI / 2) * radius
  const topEdgeLength = width / 2 - radius
  const totalLength = leftEdgeLength + cornerLength + topEdgeLength
  const distance = progress * totalLength

  if (distance <= leftEdgeLength) {
    const segmentProgress = distance / leftEdgeLength
    return { x: 0, y: height / 2 - segmentProgress * leftEdgeLength }
  }

  const cornerDistance = distance - leftEdgeLength
  if (cornerDistance <= cornerLength) {
    const segmentProgress = cornerDistance / cornerLength
    const startAngle = Math.PI
    const endAngle = Math.PI * 1.5
    const angle = startAngle + segmentProgress * (endAngle - startAngle)
    return {
      x: radius + radius * Math.cos(angle),
      y: radius + radius * Math.sin(angle),
    }
  }

  const topDistance = distance - leftEdgeLength - cornerLength
  const segmentProgress = topDistance / topEdgeLength
  return { x: radius + segmentProgress * (width / 2 - radius), y: 0 }
}

export function getTargetHandleSide(progress: number): "left" | "top" {
  return progress >= 0.5 ? "top" : "left"
}

export function getSourceHandlePoint(
  progress: number,
  width: number,
  height: number,
  radius: number,
): { x: number; y: number } {
  if (progress <= 0) {
    return { x: width, y: height / 2 }
  }

  if (progress >= 1) {
    return { x: width / 2, y: height }
  }

  const rightEdgeLength = height / 2 - radius
  const cornerLength = (Math.PI / 2) * radius
  const bottomEdgeLength = width / 2 - radius
  const totalLength = rightEdgeLength + cornerLength + bottomEdgeLength
  const distance = progress * totalLength

  if (distance <= rightEdgeLength) {
    const segmentProgress = distance / rightEdgeLength
    return { x: width, y: height / 2 + segmentProgress * rightEdgeLength }
  }

  const cornerDistance = distance - rightEdgeLength
  if (cornerDistance <= cornerLength) {
    const segmentProgress = cornerDistance / cornerLength
    const startAngle = 0
    const endAngle = Math.PI / 2
    const angle = startAngle + segmentProgress * (endAngle - startAngle)
    const cornerCenterX = width - radius
    const cornerCenterY = height - radius
    return {
      x: cornerCenterX + radius * Math.cos(angle),
      y: cornerCenterY + radius * Math.sin(angle),
    }
  }

  const bottomDistance = distance - rightEdgeLength - cornerLength
  const segmentProgress = bottomDistance / bottomEdgeLength
  return { x: width - radius - segmentProgress * (width / 2 - radius), y: height }
}

export function getSourceHandleSide(progress: number): "right" | "bottom" {
  return progress >= 0.5 ? "bottom" : "right"
}

export function getHandleSideFromPoint(
  point: { x: number; y: number },
  width: number,
  height: number,
): "left" | "top" | "right" | "bottom" {
  const threshold = 2
  const onRightEdge = point.x >= width - threshold
  const onBottomEdge = point.y >= height - threshold
  const onTopEdge = point.y <= threshold
  const onLeftEdge = point.x <= threshold

  if (onBottomEdge && !onRightEdge) {
    return "bottom"
  }

  if (onRightEdge && !onBottomEdge) {
    return "right"
  }

  if (onTopEdge && !onLeftEdge) {
    return "top"
  }

  if (onLeftEdge && !onTopEdge) {
    return "left"
  }

  const dx = point.x - width / 2
  const dy = point.y - height / 2

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left"
  }

  return dy > 0 ? "bottom" : "top"
}

export function getHandleStyle(
  point: { x: number; y: number },
  width: number,
  height: number,
): {
  left: string;
  top: string;
  right: "auto";
  bottom: "auto";
  transform: string;
} {
  return {
    left: `${(point.x / width) * 100}%`,
    top: `${(point.y / height) * 100}%`,
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  }
}

export function getDlqHandlePoint(
  progress: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const radius = height / 2

  if (progress <= 0) {
    return { x: 0, y: height / 2 }
  }

  if (progress >= 1) {
    return { x: width, y: height / 2 }
  }

  const leftArcLength = (Math.PI / 2) * radius
  const topStraightLength = Math.max(0, width - height)
  const rightArcLength = (Math.PI / 2) * radius
  const totalLength = leftArcLength + topStraightLength + rightArcLength
  let distance = progress * totalLength

  if (distance <= leftArcLength) {
    const segmentProgress = distance / leftArcLength
    const angle = Math.PI + segmentProgress * (Math.PI / 2)
    return {
      x: radius + radius * Math.cos(angle),
      y: radius + radius * Math.sin(angle),
    }
  }

  distance -= leftArcLength

  if (distance <= topStraightLength) {
    const segmentProgress = topStraightLength === 0 ? 1 : distance / topStraightLength
    return { x: radius + segmentProgress * (width - height), y: 0 }
  }

  distance -= topStraightLength
  const segmentProgress = distance / rightArcLength
  const angle = -Math.PI / 2 + segmentProgress * (Math.PI / 2)
  const centerX = width - radius

  return {
    x: centerX + radius * Math.cos(angle),
    y: radius + radius * Math.sin(angle),
  }
}
