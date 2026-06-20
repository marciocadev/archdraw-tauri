import { useEffect, useRef, useState } from "react"
import { LeftSideBar } from "./components/LeftSideBar"
import { MainContent, type DiagramCanvasHandle } from "./components/MainContent"
import { Header } from "./components/Header"
import { WindowsTitleBar } from "./components/WindowsTitleBar"
import { useIsWindowsDesktop } from "./hooks/useIsWindowsDesktop"
import type { ColorMode } from "@xyflow/react"

function App() {
  const [showLeftSideBar, setShowLeftSideBar] = useState(true)
  const [colorMode, setColorMode] = useState<ColorMode>("dark")
  const [diagramSession, setDiagramSession] = useState(0)
  const isWindowsDesktop = useIsWindowsDesktop()
  const diagramRef = useRef<DiagramCanvasHandle>(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", colorMode === "dark")
  }, [colorMode])

  const onThemeToggle = () => {
    setColorMode((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const onHorizontalLeftBarToggle = () => {
    setShowLeftSideBar(!showLeftSideBar)
  }

  const onSaveDiagram = () => {
    void diagramRef.current?.saveDiagram()
  }

  const onOpenDiagram = () => {
    void diagramRef.current?.openDiagram()
  }

  return (
    <div className="flex h-screen flex-1 flex-col">
      {isWindowsDesktop ? (
        <WindowsTitleBar
          colorMode={colorMode}
          horizontalLeftBar={showLeftSideBar}
          onHorizontalLeftBarToggle={onHorizontalLeftBarToggle}
          onOpen={onOpenDiagram}
          onSave={onSaveDiagram}
          onThemeToggle={onThemeToggle}
        />
      ) : (
        <Header
          onThemeToggle={onThemeToggle}
          colorMode={colorMode}
          onHorizontalLeftBarToggle={onHorizontalLeftBarToggle}
          horizontalLeftBar={showLeftSideBar}
          onOpen={onOpenDiagram}
          onSave={onSaveDiagram}
        />
      )}
      <main className="flex min-h-0 flex-1 flex-row">
        <LeftSideBar showLeftSideBar={showLeftSideBar} />
        <MainContent ref={diagramRef} key={diagramSession} colorMode={colorMode} />
      </main>
    </div>
  )
}

export default App
