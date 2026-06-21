import { HideHorizontalLeftBarSvg } from "./svg/SpliHorizontalLeftBarSvg";
import { ThemeModeSvg } from "./svg/ThemeModeSvg"
import { CodeMenu } from "./CodeMenu"
import { FileMenu } from "./FileMenu"
import type { CodeGeneratorType } from "../codegen/types"

export interface HeaderProps {
  onThemeToggle: () => void;
  colorMode: string;
  onHorizontalLeftBarToggle: () => void;
  horizontalLeftBar: boolean;
  onOpen: () => void
  onSave: () => void
  onGenerateCode: (generatorType: CodeGeneratorType) => void
}

export const Header = (props: HeaderProps) => {
  const {
    onThemeToggle,
    colorMode,
    onHorizontalLeftBarToggle,
    horizontalLeftBar,
    onOpen,
    onSave,
    onGenerateCode,
  } = props

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

            <div className="flex items-center gap-1">
              <FileMenu onSave={onSave} onOpen={onOpen} />
              <CodeMenu onGenerate={onGenerateCode} />
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
