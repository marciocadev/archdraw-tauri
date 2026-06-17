import { HideHorizontalLeftBarSvg } from "./svg/SpliHorizontalLeftBarSvg";
import { ThemeModeSvg } from "./svg/ThemeModeSvg"

export interface HeaderProps {
  onThemeToggle: () => void;
  colorMode: string;
  onHorizontalLeftBarToggle: () => void;
  horizontalLeftBar: boolean;
}

export const Header = (props: HeaderProps) => {
  const { onThemeToggle, colorMode, onHorizontalLeftBarToggle, horizontalLeftBar } = props
  return (
    <>
      <div className={`w-full h-8 flex items-center justify-between px-2
        dark:bg-mist-900 dark:text-slate-200
        bg-slate-100 text-slate-700`}>
        <div className="flex items-center justify-start">
          {/* <div>
            Header
          </div>
          <div>
            Header
          </div> */}
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