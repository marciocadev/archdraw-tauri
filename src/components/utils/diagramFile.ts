import type { ArchitectureEdgeType } from "../edges/ArchitectureEdge"
import type { FlowNode } from "./groupNode"

export const DIAGRAM_FILE_VERSION = 1
export const DIAGRAM_FILE_EXTENSION = "ad"

export interface DiagramDocument {
  version: typeof DIAGRAM_FILE_VERSION
  format: "archdraw-diagram"
  nodes: FlowNode[]
  edges: ArchitectureEdgeType[]
}

export function createDiagramDocument(
  nodes: FlowNode[],
  edges: ArchitectureEdgeType[],
): DiagramDocument {
  return {
    version: DIAGRAM_FILE_VERSION,
    format: "archdraw-diagram",
    nodes,
    edges,
  }
}

export function serializeDiagramDocument(document: DiagramDocument): string {
  return JSON.stringify(document, null, 2)
}

export function ensureDiagramExtension(path: string): string {
  return path.toLowerCase().endsWith(`.${DIAGRAM_FILE_EXTENSION}`)
    ? path
    : `${path}.${DIAGRAM_FILE_EXTENSION}`
}

export function parseDiagramDocument(raw: string): DiagramDocument {
  const parsed: unknown = JSON.parse(raw)

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid diagram file.")
  }

  const document = parsed as Partial<DiagramDocument>

  if (document.format !== "archdraw-diagram") {
    throw new Error("Unsupported diagram format.")
  }

  if (!Array.isArray(document.nodes) || !Array.isArray(document.edges)) {
    throw new Error("Diagram file is missing nodes or edges.")
  }

  return {
    version: DIAGRAM_FILE_VERSION,
    format: "archdraw-diagram",
    nodes: document.nodes,
    edges: document.edges,
  }
}
