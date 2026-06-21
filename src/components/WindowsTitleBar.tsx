import { getCurrentWindow } from "@tauri-apps/api/window"
import { useState } from "react"
import { HideHorizontalLeftBarSvg } from "./svg/SpliHorizontalLeftBarSvg"
import { ThemeModeSvg } from "./svg/ThemeModeSvg"
import { ChromeCloseButtonSvg } from "./svg/ChromeCloseButtonSvg"
import { ChromeMinimizeButtonSvg } from "./svg/ChromeMinimizeButtonSvg"
import { ChromeRestoreButtonSvg } from "./svg/ChromeRestoreButtonSvg"
import { ChromeMaximizeButtonSvg } from "./svg/ChromeMaximizeButtonSvg"
import { CodeMenu } from "./CodeMenu"
import { FileMenu } from "./FileMenu"
import type { CodeGeneratorType } from "../codegen/types"

export interface WindowsTitleBarProps {
  colorMode: string
  horizontalLeftBar: boolean
  onHorizontalLeftBarToggle: () => void
  onOpen: () => void
  onSave: () => void
  onThemeToggle: () => void
  onGenerateCode: (generatorType: CodeGeneratorType) => void
}

export const WindowsTitleBar = (props: WindowsTitleBarProps) => {
  const {
    colorMode,
    horizontalLeftBar,
    onHorizontalLeftBarToggle,
    onOpen,
    onSave,
    onThemeToggle,
    onGenerateCode,
  } = props

  const [isMaximized, setIsMaximized] = useState(false)

  const handleExit = async () => {
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
          src="/icon-32x32.png"
          alt="ArchDraw"
          className="h-4 w-4 shrink-0"
          draggable={false}
        />

        <div className="flex items-center gap-1">
          <FileMenu onSave={onSave} onOpen={onOpen} onExit={() => void handleExit()} />
          <CodeMenu onGenerate={onGenerateCode} />
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
          <ChromeMinimizeButtonSvg />
        </button>

        <button
          type="button"
          aria-label="Maximize"
          className="flex h-8 w-11 items-center justify-center hover:bg-slate-300/70 dark:hover:bg-slate-700"
          onClick={() => void handleToggleMaximize()}
        >
          {isMaximized ? <ChromeRestoreButtonSvg /> : <ChromeMaximizeButtonSvg />}
        </button>

        <button
          type="button"
          aria-label="Close"
          className="flex h-8 w-11 items-center justify-center hover:bg-red-600 hover:text-white"
          onClick={() => void handleClose()}
        >
          <ChromeCloseButtonSvg />
        </button>
      </div>
    </div>
  )
}
