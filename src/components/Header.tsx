import { useState } from "react";
import { HideHorizontalLeftBarSvg } from "./svg/SpliHorizontalLeftBarSvg";
import { ThemeModeSvg } from "./svg/ThemeModeSvg"

export interface HeaderProps {
  onThemeToggle: () => void;
  colorMode: string;
  onHorizontalLeftBarToggle: () => void;
  horizontalLeftBar: boolean;
  onOpen: () => void
  onSave: () => void
}

export const Header = (props: HeaderProps) => {
  const { onThemeToggle, colorMode, onHorizontalLeftBarToggle, horizontalLeftBar, onOpen, onSave } = props

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)


  const handleOpen = () => {
    setIsFileMenuOpen(false)
    onOpen()
  }

  const handleSave = () => {
    setIsFileMenuOpen(false)
    onSave()
  }

  return (
    <>
      <div className={`w-full h-8 flex items-center justify-between px-2
        dark:bg-mist-900 dark:text-slate-200
        bg-mist-200 text-slate-700`}>
        <div className="flex items-center justify-start">
          <div className="flex h-full shrink-0 items-center gap-2 pl-2">
            <img
              src="/icon-32x32.png"
              alt="ArchDraw"
              className="h-4 w-4 shrink-0"
              draggable={false}
            />

            <div className="relative">
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
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={handleOpen}
                  >
                    Open
                  </button>
                </div>


              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start">
          <div className="p-1">
            <button type="button" className="flex items-center justify-center" onClick={onHorizontalLeftBarToggle}>
              <HideHorizontalLeftBarSvg horizontalLeftBar={horizontalLeftBar} />
            </button>
          </div>
          <div className="p-1">
            <button type="button" className="flex items-center justify-center" onClick={onThemeToggle}>
              <ThemeModeSvg theme={colorMode} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}