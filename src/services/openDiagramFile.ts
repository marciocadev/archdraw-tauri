import { open } from "@tauri-apps/plugin-dialog"
import { readTextFile } from "@tauri-apps/plugin-fs"
import {
  parseDiagramDocument,
  type DiagramDocument,
} from "../components/utils/diagramFile"

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export async function openDiagramFromFile(): Promise<DiagramDocument | null> {
  if (!isTauriRuntime()) {
    return null
  }

  const selectedPath = await open({
    title: "Open Diagram",
    multiple: false,
    filters: [
      {
        name: "ArchDraw Diagram",
        extensions: ["ad"],
      },
    ],
  })

  if (!selectedPath || Array.isArray(selectedPath)) {
    return null
  }

  const raw = await readTextFile(selectedPath)
  return parseDiagramDocument(raw)
}
