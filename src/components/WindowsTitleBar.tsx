import { getCurrentWindow } from "@tauri-apps/api/window"
import { useEffect, useRef, useState } from "react"
import { HideHorizontalLeftBarSvg } from "./svg/SpliHorizontalLeftBarSvg"
import { ThemeModeSvg } from "./svg/ThemeModeSvg"
import { ChromeCloseButtonSvg } from "./svg/ChromeCloseButtonSvg"
import { ChromeMinimizeButtonSvg } from "./svg/ChromeMinimizeButtonSvg"
import { ChromeRestoreButtonSvg } from "./svg/ChromeRestoreButtonSvg"
import { ChromeMaximizeButtonSvg } from "./svg/ChromeMaximizeButtonSvg"

export interface WindowsTitleBarProps {
  colorMode: string
  horizontalLeftBar: boolean
  onHorizontalLeftBarToggle: () => void
  onNew: () => void
  onThemeToggle: () => void
}

export const WindowsTitleBar = (props: WindowsTitleBarProps) => {
  const {
    colorMode,
    horizontalLeftBar,
    onHorizontalLeftBarToggle,
    onNew,
    onThemeToggle,
  } = props

  const [isMaximized, setIsMaximized] = useState(false)

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
  const fileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFileMenuOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!fileMenuRef.current?.contains(event.target as Node)) {
        setIsFileMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isFileMenuOpen])

  const handleNew = () => {
    setIsFileMenuOpen(false)
    onNew()
  }

  const handleExit = async () => {
    setIsFileMenuOpen(false)
    await getCurrentWindow().close()
  }

  const handleMinimize = async () => {
    await getCurrentWindow().minimize()
    setIsMaximized(await getCurrentWindow().isMaximized())
  }

  const handleToggleMaximize = async () => {
    await getCurrentWindow().toggleMaximize()
    setIsMaximized(await getCurrentWindow().isMaximized())
  }

  const handleClose = async () => {
    await getCurrentWindow().close()
  }

  return (
    <div
      className="flex h-8 w-full shrink-0 items-center border-b border-slate-300 bg-mist-200 text-slate-700
        select-none dark:border-slate-600 dark:bg-mist-900 dark:text-slate-200"
    >
      <div className="flex h-full shrink-0 items-center gap-2 pl-2">
        <img
          src="/app-icon.png"
          alt="ArchDraw"
          className="h-4 w-4 shrink-0"
          draggable={false}
        />

        <div ref={fileMenuRef} className="relative">
          <button
            type="button"
            className="px-2 py-1 text-sm hover:bg-slate-300/70 dark:hover:bg-slate-700"
            onClick={() => setIsFileMenuOpen((open) => !open)}
          >
            File
          </button>

          {isFileMenuOpen && (
            <div
              className="absolute top-full left-0 z-50 min-w-32 border border-slate-300 bg-white py-1 shadow-lg
                dark:border-slate-600 dark:bg-slate-800"
            >
              <button
                type="button"
                className="block w-full px-4 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={handleNew}
              >
                New
              </button>
              <button
                type="button"
                className="block w-full px-4 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => void handleExit()}
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </div>

      <div data-tauri-drag-region className="h-full min-w-0 flex-1" />

      <div className="flex h-full shrink-0 items-center">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center hover:bg-slate-300/70 dark:hover:bg-slate-700"
          onClick={onHorizontalLeftBarToggle}
        >
          <HideHorizontalLeftBarSvg horizontalLeftBar={horizontalLeftBar} />
        </button>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center hover:bg-slate-300/70 dark:hover:bg-slate-700"
          onClick={onThemeToggle}
        >
          <ThemeModeSvg theme={colorMode} />
        </button>

        <button
          type="button"
          aria-label="Minimize"
          className="flex h-8 w-11 items-center justify-center hover:bg-slate-300/70 dark:hover:bg-slate-700"
          onClick={() => void handleMinimize()}
        >
          {/* <span className="block h-px w-3 bg-current" /> */}
          <ChromeMinimizeButtonSvg />
        </button>

        <button
          type="button"
          aria-label="Maximize"
          className="flex h-8 w-11 items-center justify-center hover:bg-slate-300/70 dark:hover:bg-slate-700"
          onClick={() => void handleToggleMaximize()}
        >
          {/* <span className="block h-2.5 w-2.5 border border-current" /> */}
          {isMaximized ? <ChromeRestoreButtonSvg /> : <ChromeMaximizeButtonSvg />}
        </button>

        <button
          type="button"
          aria-label="Close"
          className="flex h-8 w-11 items-center justify-center hover:bg-red-600 hover:text-white"
          onClick={() => void handleClose()}
        >
          {/* <span className="text-lg leading-none">×</span> */}
          <ChromeCloseButtonSvg />
        </button>
      </div>
    </div>
  )
}
