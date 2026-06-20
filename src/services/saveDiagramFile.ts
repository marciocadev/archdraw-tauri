import { save } from "@tauri-apps/plugin-dialog"
import { invoke } from "@tauri-apps/api/core"
import {
  createDiagramDocument,
  ensureDiagramExtension,
  serializeDiagramDocument,
  type DiagramDocument,
} from "../components/utils/diagramFile"

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export async function saveDiagramToFile(document: DiagramDocument): Promise<boolean> {
  if (!isTauriRuntime()) {
    return false
  }

  try {
    const selectedPath = await save({
      title: "Save Diagram",
      defaultPath: "diagram.ad",
      filters: [
        {
          name: "ArchDraw Diagram",
          extensions: ["ad"],
        },
      ],
    })

    if (!selectedPath) {
      return false
    }

    const filePath = ensureDiagramExtension(selectedPath)
    await invoke("save_diagram_file", {
      path: filePath,
      content: serializeDiagramDocument(document),
    })
    return true
  } catch (error) {
    console.error("Failed to save diagram file", error)
    return false
  }
}

export async function saveDiagramFromCanvas(
  nodes: DiagramDocument["nodes"],
  edges: DiagramDocument["edges"],
): Promise<boolean> {
  return saveDiagramToFile(createDiagramDocument(nodes, edges))
}
