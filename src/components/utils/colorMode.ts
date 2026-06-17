import { useSyncExternalStore } from "react"
import type { ColorMode } from "@xyflow/react"

function subscribeToDocumentColorMode(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })

  return () => observer.disconnect()
}

function getDocumentColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function useDocumentColorMode(): ColorMode {
  return useSyncExternalStore(
    subscribeToDocumentColorMode,
    getDocumentColorMode,
    () => "light",
  )
}
