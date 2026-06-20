import { useEffect, useState } from "react"
import { LeftSideBar } from "./components/LeftSideBar"
import { MainContent } from "./components/MainContent"
import { Header } from "./components/Header"
import { WindowsTitleBar } from "./components/WindowsTitleBar"
import { useIsWindowsDesktop } from "./hooks/useIsWindowsDesktop"
import type { ColorMode } from "@xyflow/react"

function App() {
  const [showLeftSideBar, setShowLeftSideBar] = useState(true)
  const [colorMode, setColorMode] = useState<ColorMode>("dark")
  const [diagramSession, setDiagramSession] = useState(0)
  const isWindowsDesktop = useIsWindowsDesktop()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", colorMode === "dark")
  }, [colorMode])

  const onThemeToggle = () => {
    setColorMode((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const onHorizontalLeftBarToggle = () => {
    setShowLeftSideBar(!showLeftSideBar)
  }

  const onNewDiagram = () => {
    setDiagramSession((session) => session + 1)
  }

  return (
    <div className="flex h-screen flex-1 flex-col">
      {isWindowsDesktop ? (
        <WindowsTitleBar
          colorMode={colorMode}
          horizontalLeftBar={showLeftSideBar}
          onHorizontalLeftBarToggle={onHorizontalLeftBarToggle}
          onNew={onNewDiagram}
          onThemeToggle={onThemeToggle}
        />
      ) : (
        <Header
          onThemeToggle={onThemeToggle}
          colorMode={colorMode}
          onHorizontalLeftBarToggle={onHorizontalLeftBarToggle}
          horizontalLeftBar={showLeftSideBar}
        />
      )}
      <main className="flex min-h-0 flex-1 flex-row">
        <LeftSideBar showLeftSideBar={showLeftSideBar} />
        <MainContent key={diagramSession} colorMode={colorMode} />
      </main>
    </div>
  )
}

export default App
