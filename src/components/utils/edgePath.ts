export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function createPathElement(path: string): SVGPathElement {
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
  pathElement.setAttribute("d", path)
  return pathElement
}

export function getPointOnEdgePath(
  path: string,
  position: number,
): { x: number; y: number } {
  const pathElement = createPathElement(path)
  const length = pathElement.getTotalLength()
  const point = pathElement.getPointAtLength(length * clamp(position, 0, 1))
  return { x: point.x, y: point.y }
}

export function getClosestPositionOnPath(
  path: string,
  x: number,
  y: number,
  samples = 80,
): number {
  const pathElement = createPathElement(path)
  const length = pathElement.getTotalLength()
  let closestPosition = 0.5
  let closestDistance = Infinity

  for (let index = 0; index <= samples; index += 1) {
    const position = index / samples
    const point = pathElement.getPointAtLength(length * position)
    const distance = (point.x - x) ** 2 + (point.y - y) ** 2

    if (distance < closestDistance) {
      closestDistance = distance
      closestPosition = position
    }
  }

  return closestPosition
}
