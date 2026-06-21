import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { ConfigPanelLayout } from "./config/ConfigPanelLayout"
import {
  createEmptyLambdaFunctionConfigErrors,
  DEFAULT_LAMBDA_EPHEMERAL_STORAGE_MB,
  DEFAULT_LAMBDA_MEMORY_MB,
  DEFAULT_LAMBDA_TIMEOUT_UNIT,
  DEFAULT_LAMBDA_TIMEOUT_VALUE,
  getDefaultLanguageForRuntime,
  getEnvironmentVariables,
  getLambdaLanguageLabel,
  getLambdaTimeoutLimits,
  hasLambdaFunctionConfigErrors,
  isCustomRuntimeLanguageSelection,
  LAMBDA_ARCHITECTURE_OPTIONS,
  LAMBDA_CUSTOM_RUNTIME_LANGUAGE_OPTIONS,
  LAMBDA_EPHEMERAL_STORAGE_MAX_MB,
  LAMBDA_EPHEMERAL_STORAGE_MIN_MB,
  LAMBDA_MEMORY_MAX_MB,
  LAMBDA_MEMORY_MIN_MB,
  LAMBDA_RUNTIME_OPTIONS,
  LAMBDA_TIMEOUT_UNITS,
  LAMBDA_TIMEOUT_UNIT_LABELS,
  validateEnvironmentVariableDraft,
  validateLambdaFunctionConfig,
  type LambdaArchitecture,
  type LambdaCustomRuntimeLanguage,
  type LambdaFunctionConfig,
  type LambdaFunctionConfigErrors,
  type LambdaRuntime,
  type LambdaTimeoutUnit,
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
  const [errors, setErrors] = useState<LambdaFunctionConfigErrors>(createEmptyLambdaFunctionConfigErrors())
  const [newEnvironmentVariableKey, setNewEnvironmentVariableKey] = useState("")
  const [newEnvironmentVariableValue, setNewEnvironmentVariableValue] = useState("")
  const [environmentVariableError, setEnvironmentVariableError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig)
      setErrors(createEmptyLambdaFunctionConfigErrors())
      setNewEnvironmentVariableKey("")
      setNewEnvironmentVariableValue("")
      setEnvironmentVariableError(null)
    }
  }, [initialConfig, isOpen])

  const timeoutLimits = useMemo(
    () => getLambdaTimeoutLimits(config.timeoutUnit),
    [config.timeoutUnit],
  )

  const handleFunctionNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((current) => ({ ...current, functionName: event.target.value }))
  }

  const handleRuntimeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const runtime = event.target.value as LambdaRuntime
    setConfig((current) => ({
      ...current,
      runtime,
      language: getDefaultLanguageForRuntime(runtime),
    }))
  }

  const handleArchitectureChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((current) => ({
      ...current,
      architecture: event.target.value as LambdaArchitecture,
    }))
  }

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((current) => ({
      ...current,
      language: event.target.value as LambdaCustomRuntimeLanguage,
    }))
  }

  const handleMemoryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({ ...current, memoryMb: parsed }))
    setErrors((current) => ({ ...current, memory: null }))
  }

  const handleEphemeralStorageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({ ...current, ephemeralStorageMb: parsed }))
    setErrors((current) => ({ ...current, ephemeralStorage: null }))
  }

  const handleTimeoutValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setConfig((current) => ({ ...current, timeoutValue: parsed }))
    setErrors((current) => ({ ...current, timeout: null }))
  }

  const handleTimeoutUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const timeoutUnit = event.target.value as LambdaTimeoutUnit
    const limits = getLambdaTimeoutLimits(timeoutUnit)

    setConfig((current) => ({
      ...current,
      timeoutUnit,
      timeoutValue: Math.min(Math.max(current.timeoutValue, limits.min), limits.max),
    }))
    setErrors((current) => ({ ...current, timeout: null }))
  }

  const handleAddEnvironmentVariable = () => {
    const validationError = validateEnvironmentVariableDraft(newEnvironmentVariableKey)
    if (validationError) {
      setEnvironmentVariableError(validationError)
      return
    }

    const trimmedKey = newEnvironmentVariableKey.trim()
    const hasDuplicateKey = getEnvironmentVariables(config.environmentVariables)
      .some((variable) => variable.key === trimmedKey)

    if (hasDuplicateKey) {
      setEnvironmentVariableError("An environment variable with this key already exists.")
      return
    }

    setConfig((current) => ({
      ...current,
      environmentVariables: [
        ...getEnvironmentVariables(current.environmentVariables),
        {
          key: trimmedKey,
          value: newEnvironmentVariableValue,
        },
      ],
    }))
    setNewEnvironmentVariableKey("")
    setNewEnvironmentVariableValue("")
    setEnvironmentVariableError(null)
  }

  const handleRemoveEnvironmentVariable = (index: number) => {
    setConfig((current) => ({
      ...current,
      environmentVariables: getEnvironmentVariables(current.environmentVariables)
        .filter((_, variableIndex) => variableIndex !== index),
    }))
  }

  const handleConfirm = () => {
    const nextErrors = validateLambdaFunctionConfig(config)
    setErrors(nextErrors)

    if (hasLambdaFunctionConfigErrors(nextErrors)) {
      return
    }

    onConfirm({
      ...config,
      functionName: config.functionName.trim(),
    })
  }

  const isCustomLanguageSelection = isCustomRuntimeLanguageSelection(config.runtime)

  return (
    <ConfigPanelLayout
      isOpen={isOpen}
      title="Lambda Function Settings"
      onConfirm={handleConfirm}
      onCancel={onCancel}>
      <div className="flex flex-col gap-3">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="lambda-runtime"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Runtime
            </label>
            <select
              id="lambda-runtime"
              value={config.runtime}
              onChange={handleRuntimeChange}
              className="form-select rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
              {LAMBDA_RUNTIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="lambda-language"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Language
            </label>
            {isCustomLanguageSelection ? (
              <select
                id="lambda-language"
                value={config.language}
                onChange={handleLanguageChange}
                className="form-select rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
                {LAMBDA_CUSTOM_RUNTIME_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="lambda-language"
                type="text"
                readOnly
                value={getLambdaLanguageLabel(config.language)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="lambda-architecture"
            className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Architecture
          </label>
          <select
            id="lambda-architecture"
            value={config.architecture}
            onChange={handleArchitectureChange}
            className="form-select rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
            {LAMBDA_ARCHITECTURE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="lambda-memory"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Memory (MB)
            </label>
            <input
              id="lambda-memory"
              type="number"
              min={LAMBDA_MEMORY_MIN_MB}
              max={LAMBDA_MEMORY_MAX_MB}
              step={1}
              value={config.memoryMb}
              onChange={handleMemoryChange}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              From {LAMBDA_MEMORY_MIN_MB} MB to {LAMBDA_MEMORY_MAX_MB} MB. Default is {DEFAULT_LAMBDA_MEMORY_MB} MB.
            </p>
            {errors.memory && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.memory}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="lambda-ephemeral-storage"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Ephemeral Storage (MB)
            </label>
            <input
              id="lambda-ephemeral-storage"
              type="number"
              min={LAMBDA_EPHEMERAL_STORAGE_MIN_MB}
              max={LAMBDA_EPHEMERAL_STORAGE_MAX_MB}
              step={1}
              value={config.ephemeralStorageMb}
              onChange={handleEphemeralStorageChange}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              From {LAMBDA_EPHEMERAL_STORAGE_MIN_MB} MB to {LAMBDA_EPHEMERAL_STORAGE_MAX_MB} MB. Default is {DEFAULT_LAMBDA_EPHEMERAL_STORAGE_MB} MB.
            </p>
            {errors.ephemeralStorage && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.ephemeralStorage}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="lambda-timeout-value"
            className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Timeout
          </label>
          <div className="flex gap-2">
            <input
              id="lambda-timeout-value"
              type="number"
              min={timeoutLimits.min}
              max={timeoutLimits.max}
              step={1}
              value={config.timeoutValue}
              onChange={handleTimeoutValueChange}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
            />
            <select
              id="lambda-timeout-unit"
              value={config.timeoutUnit}
              onChange={handleTimeoutUnitChange}
              className="form-select w-32 shrink-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
              {LAMBDA_TIMEOUT_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {LAMBDA_TIMEOUT_UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            From 1 second to 15 minutes. Default is {DEFAULT_LAMBDA_TIMEOUT_VALUE} {DEFAULT_LAMBDA_TIMEOUT_UNIT}.
          </p>
          {errors.timeout && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.timeout}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Environment Variables
          </h3>

          {getEnvironmentVariables(config.environmentVariables).length > 0 && (
            <ul className="flex flex-col gap-2">
              {getEnvironmentVariables(config.environmentVariables).map((variable, index) => (
                <li
                  key={`${variable.key}-${index}`}
                  className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <span>
                    <span className="font-medium">{variable.key}</span>
                    {" = "}
                    {variable.value || "(empty)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEnvironmentVariable(index)}
                    className="shrink-0 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="lambda-env-key"
                className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Key
              </label>
              <input
                id="lambda-env-key"
                type="text"
                value={newEnvironmentVariableKey}
                onChange={(event) => {
                  setNewEnvironmentVariableKey(event.target.value)
                  setEnvironmentVariableError(null)
                }}
                placeholder="VARIABLE_NAME"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="lambda-env-value"
                className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Value
              </label>
              <input
                id="lambda-env-value"
                type="text"
                value={newEnvironmentVariableValue}
                onChange={(event) => setNewEnvironmentVariableValue(event.target.value)}
                placeholder="value"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {environmentVariableError && (
            <p className="text-xs text-red-600 dark:text-red-400">{environmentVariableError}</p>
          )}

          <button
            type="button"
            onClick={handleAddEnvironmentVariable}
            className="self-start rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500">
            Add Variable
          </button>
        </div>
      </div>
    </ConfigPanelLayout>
  )
}
