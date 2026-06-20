import { useEffect, useState, type ChangeEvent } from "react"
import { ConfigPanelLayout } from "./config/ConfigPanelLayout"
import {
  type LambdaFunctionConfig,
} from "./utils/lambdaFunctionTypes"

export interface LambdaFunctionConfigPanelProps {
  isOpen: boolean
  initialConfig: LambdaFunctionConfig
  onConfirm: (config: LambdaFunctionConfig) => void
  onCancel: () => void
}

export const LambdaFunctionConfigPanel = (props: LambdaFunctionConfigPanelProps) => {
  const { isOpen, initialConfig, onConfirm, onCancel } = props
  const [config, setConfig] = useState<LambdaFunctionConfig>(initialConfig)

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig)
    }
  }, [initialConfig, isOpen])

  const handleFunctionNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((current) => ({ ...current, functionName: event.target.value }))
  }

  return (
    <ConfigPanelLayout
      isOpen={isOpen}
      title="Lambda Function Settings"
      onConfirm={() => onConfirm(config)}
      onCancel={onCancel}>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="lambda-function-name"
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Function Name
        </label>
        <input
          id="lambda-function-name"
          type="text"
          value={config.functionName}
          onChange={handleFunctionNameChange}
          placeholder="Enter the function name"
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
        />
      </div>
    </ConfigPanelLayout>
  )
}
