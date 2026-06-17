import { useEffect, useState } from "react"
import { LeftSideBar } from "./components/LeftSideBar"
import { MainContent } from "./components/MainContent"
import { Header } from "./components/Header"
import type { ColorMode } from "@xyflow/react"

function App() {
  const [showLeftSideBar, setShowLeftSideBar] = useState(true)
  const [colorMode, setColorMode] = useState<ColorMode>('dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark')
  }, [colorMode])

  const onThemeToggle = () => {
    setColorMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const onHorizontalLeftBarToggle = () => {
    setShowLeftSideBar(!showLeftSideBar)
  }

  return (
    <>
      <div className="flex flex-1 flex-col h-screen">
        <Header onThemeToggle={onThemeToggle} colorMode={colorMode}
          onHorizontalLeftBarToggle={onHorizontalLeftBarToggle} horizontalLeftBar={showLeftSideBar} />
        <main className="flex flex-1 min-h-0 flex-row">
          <LeftSideBar showLeftSideBar={showLeftSideBar} />
          <MainContent colorMode={colorMode} />
        </main>
      </div>
    </>
  )
}

export default App
