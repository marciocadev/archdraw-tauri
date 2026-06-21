import type { ArchitectureEdgeType } from "../components/edges/ArchitectureEdge"
import {
  createDiagramDocument,
  parseDiagramDocument,
  serializeDiagramDocument,
} from "../components/utils/diagramFile"
import { normalizeNodes, type FlowNode } from "../components/utils/groupNode"

const DIAGRAM_SESSION_STORAGE_KEY = "archdraw.diagram.session"

export interface DiagramSessionState {
  nodes: FlowNode[]
  edges: ArchitectureEdgeType[]
}

export function loadDiagramSession(): DiagramSessionState | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = sessionStorage.getItem(DIAGRAM_SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const document = parseDiagramDocument(raw)
    return {
      nodes: normalizeNodes(document.nodes),
      edges: document.edges.map((edge) => ({ ...edge, selected: false })),
    }
  } catch {
    return null
  }
}

export function saveDiagramSession(nodes: FlowNode[], edges: ArchitectureEdgeType[]): void {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.setItem(
    DIAGRAM_SESSION_STORAGE_KEY,
    serializeDiagramDocument(createDiagramDocument(nodes, edges)),
  )
}

export function getInitialDiagramState(): DiagramSessionState {
  return loadDiagramSession() ?? { nodes: [], edges: [] }
}
