import { DiagramButton } from "./button/DiagramButton"
import { awsComponents } from "./utils/awsComponents"

export interface LeftSideBarProps {
  showLeftSideBar: boolean
}

export const LeftSideBar = (props: LeftSideBarProps) => {
  const { showLeftSideBar } = props

  if (!showLeftSideBar) {
    return null
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-slate-300 bg-slate-100 p-2
     dark:border-slate-600 dark:bg-mist-900">
      {awsComponents.map((component) => {
        const Svg = component.svg
        return (
          <DiagramButton
            key={component.key}
            type={component.type}
            component={component.component}
            diagramKey={component.key}
          >
            <Svg />
          </DiagramButton>
        )
      })}
    </aside>
  )
}
