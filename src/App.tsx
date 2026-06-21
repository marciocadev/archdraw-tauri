import { useEffect, useRef, useState } from "react"
import { LeftSideBar } from "./components/LeftSideBar"
import { MainContent, type DiagramCanvasHandle } from "./components/MainContent"
import { Header } from "./components/Header"
import { WindowsTitleBar } from "./components/WindowsTitleBar"
import { StackNameDialog } from "./components/StackNameDialog"
import { useIsWindowsDesktop } from "./hooks/useIsWindowsDesktop"
import type { ColorMode } from "@xyflow/react"
import type { CodeGeneratorType } from "./codegen/types"
import { generateCodeProject } from "./services/generateCodeProject"

const CODE_GENERATOR_LABELS: Record<CodeGeneratorType, string> = {
  terraform: "Terraform",
  "aws-cdk": "AWS CDK",
}

function App() {
  const [showLeftSideBar, setShowLeftSideBar] = useState(true)
  const [colorMode, setColorMode] = useState<ColorMode>("dark")
  const [pendingGeneratorType, setPendingGeneratorType] = useState<CodeGeneratorType | null>(null)
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

  const onGenerateCode = (generatorType: CodeGeneratorType) => {
    setPendingGeneratorType(generatorType)
  }

  const onStackNameCancel = () => {
    setPendingGeneratorType(null)
  }

  const onStackNameConfirm = (stackName: string) => {
    const generatorType = pendingGeneratorType
    setPendingGeneratorType(null)

    if (!generatorType) {
      return
    }

    const nodes = diagramRef.current?.getNodes() ?? []
    void generateCodeProject(generatorType, stackName, nodes)
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
          onGenerateCode={onGenerateCode}
        />
      ) : (
        <Header
          onThemeToggle={onThemeToggle}
          colorMode={colorMode}
          onHorizontalLeftBarToggle={onHorizontalLeftBarToggle}
          horizontalLeftBar={showLeftSideBar}
          onOpen={onOpenDiagram}
          onSave={onSaveDiagram}
          onGenerateCode={onGenerateCode}
        />
      )}
      <main className="flex min-h-0 flex-1 flex-row">
        <LeftSideBar showLeftSideBar={showLeftSideBar} />
        <MainContent ref={diagramRef} colorMode={colorMode} />
      </main>
      <StackNameDialog
        isOpen={pendingGeneratorType !== null}
        title={
          pendingGeneratorType
            ? `${CODE_GENERATOR_LABELS[pendingGeneratorType]} Stack Name`
            : "Stack Name"
        }
        onConfirm={onStackNameConfirm}
        onCancel={onStackNameCancel}
      />
    </div>
  )
}

export default App
