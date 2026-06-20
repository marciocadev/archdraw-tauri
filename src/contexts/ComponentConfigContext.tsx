import { createContext, useContext } from "react"

interface ComponentConfigContextValue {
  openConfig: (nodeId: string) => void
}

const ComponentConfigContext = createContext<ComponentConfigContextValue | null>(null)

export const ComponentConfigProvider = ComponentConfigContext.Provider

export function useComponentConfig(): ComponentConfigContextValue {
  const context = useContext(ComponentConfigContext)

  if (!context) {
    throw new Error("useComponentConfig must be used within ComponentConfigProvider")
  }

  return context
}
