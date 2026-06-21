import { type as osType } from "@tauri-apps/plugin-os"
import { useEffect, useState } from "react"

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export function useIsWindowsDesktop(): boolean {
  const [isWindowsDesktop, setIsWindowsDesktop] = useState(false)

  useEffect(() => {
    if (!isTauriRuntime()) {
      return
    }

    try {
      setIsWindowsDesktop(osType() === "windows")
    } catch {
      setIsWindowsDesktop(false)
    }
  }, [])

  return isWindowsDesktop
}
