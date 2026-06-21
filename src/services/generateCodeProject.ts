import { join } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import type { FlowNode } from "../components/utils/groupNode"
import type { ArchitectureEdgeType } from "../components/edges/ArchitectureEdge"
import { extractDiagramResources } from "../codegen/extractDiagramResources"
import { generateProjectFiles } from "../codegen/generateProjectFiles"
import { toStackDirectoryName } from "../codegen/sanitizeNames"
import type { CodeGeneratorType } from "../codegen/types"

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export async function writeProjectToDirectory(
  projectDirectory: string,
  generatorType: CodeGeneratorType,
  stackName: string,
  nodes: FlowNode[],
  edges: ArchitectureEdgeType[] = [],
): Promise<boolean> {
  if (!isTauriRuntime()) {
    return false
  }

  try {
    const resources = extractDiagramResources(nodes, edges)
    const files = generateProjectFiles({
      generatorType,
      stackName,
      resources,
    })

    await invoke("write_project_files", {
      basePath: projectDirectory,
      files: files.map((file) => ({
        relative_path: file.relativePath,
        content: file.content,
      })),
    })

    return true
  } catch (error) {
    console.error("Failed to generate code project", error)
    return false
  }
}

export async function pickProjectParentDirectory(title: string): Promise<string | null> {
  if (!isTauriRuntime()) {
    return null
  }

  const selectedPath = await open({
    title,
    directory: true,
    multiple: false,
  })

  if (!selectedPath || Array.isArray(selectedPath)) {
    return null
  }

  return selectedPath
}

export async function generateCodeProject(
  generatorType: CodeGeneratorType,
  stackName: string,
  nodes: FlowNode[],
  edges: ArchitectureEdgeType[] = [],
): Promise<boolean> {
  const directoryName = toStackDirectoryName(stackName)
  if (!directoryName) {
    return false
  }

  const parentDirectory = await pickProjectParentDirectory("Select project location")
  if (!parentDirectory) {
    return false
  }

  const projectDirectory = await join(parentDirectory, directoryName)
  return writeProjectToDirectory(projectDirectory, generatorType, stackName, nodes, edges)
}
