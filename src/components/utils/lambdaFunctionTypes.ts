export const LAMBDA_RUNTIME_OPTIONS = [
  { value: "nodejs-24", label: "Node.js 24.x" },
  { value: "python-3-14", label: "Python 3.14" },
  { value: "amazon-linux-2023", label: "Amazon Linux 2023 (for Go, Rust, C++, custom)" },
] as const

export type LambdaRuntime = (typeof LAMBDA_RUNTIME_OPTIONS)[number]["value"]

export const DEFAULT_LAMBDA_RUNTIME: LambdaRuntime = "nodejs-24"

export const LAMBDA_ARCHITECTURE_OPTIONS = [
  { value: "ARM_64", label: "ARM64 (ARM_64)" },
  { value: "X86_64", label: "X86_64" },
] as const

export type LambdaArchitecture = (typeof LAMBDA_ARCHITECTURE_OPTIONS)[number]["value"]

export const DEFAULT_LAMBDA_ARCHITECTURE: LambdaArchitecture = "X86_64"

export const LAMBDA_CUSTOM_RUNTIME_LANGUAGE_OPTIONS = [
  { value: "go", label: "Go" },
] as const

export type LambdaCustomRuntimeLanguage = (typeof LAMBDA_CUSTOM_RUNTIME_LANGUAGE_OPTIONS)[number]["value"]

export type LambdaLanguage = "typescript" | "python" | LambdaCustomRuntimeLanguage

export const LAMBDA_MEMORY_MIN_MB = 128
export const LAMBDA_MEMORY_MAX_MB = 10240
export const DEFAULT_LAMBDA_MEMORY_MB = 128

export const LAMBDA_EPHEMERAL_STORAGE_MIN_MB = 512
export const LAMBDA_EPHEMERAL_STORAGE_MAX_MB = 10240
export const DEFAULT_LAMBDA_EPHEMERAL_STORAGE_MB = 512

export const LAMBDA_TIMEOUT_UNITS = ["seconds", "minutes"] as const

export type LambdaTimeoutUnit = (typeof LAMBDA_TIMEOUT_UNITS)[number]

export const LAMBDA_TIMEOUT_UNIT_LABELS: Record<LambdaTimeoutUnit, string> = {
  seconds: "Seconds",
  minutes: "Minutes",
}

export const DEFAULT_LAMBDA_TIMEOUT_VALUE = 3
export const DEFAULT_LAMBDA_TIMEOUT_UNIT: LambdaTimeoutUnit = "seconds"
export const LAMBDA_TIMEOUT_MIN_SECONDS = 1
export const LAMBDA_TIMEOUT_MAX_SECONDS = 15 * 60

export interface LambdaTimeoutLimits {
  min: number
  max: number
}

export interface LambdaEnvironmentVariable {
  key: string
  value: string
}

export interface LambdaFunctionConfig {
  functionName: string
  runtime: LambdaRuntime
  architecture: LambdaArchitecture
  language: LambdaLanguage
  memoryMb: number
  ephemeralStorageMb: number
  timeoutValue: number
  timeoutUnit: LambdaTimeoutUnit
  environmentVariables: LambdaEnvironmentVariable[]
}

export interface LambdaFunctionConfigInput {
  functionName?: string
  runtime?: LambdaRuntime
  architecture?: LambdaArchitecture
  language?: LambdaLanguage
  memoryMb?: number
  ephemeralStorageMb?: number
  timeoutValue?: number
  timeoutUnit?: LambdaTimeoutUnit
  environmentVariables?: LambdaEnvironmentVariable[]
}

export interface LambdaFunctionConfigErrors {
  memory: string | null
  ephemeralStorage: string | null
  timeout: string | null
}

export function createEmptyLambdaFunctionConfigErrors(): LambdaFunctionConfigErrors {
  return {
    memory: null,
    ephemeralStorage: null,
    timeout: null,
  }
}

export function hasLambdaFunctionConfigErrors(errors: LambdaFunctionConfigErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export function getDefaultLanguageForRuntime(runtime: LambdaRuntime): LambdaLanguage {
  switch (runtime) {
    case "nodejs-24":
      return "typescript"
    case "python-3-14":
      return "python"
    case "amazon-linux-2023":
      return "go"
  }
}

export function isCustomRuntimeLanguageSelection(runtime: LambdaRuntime): boolean {
  return runtime === "amazon-linux-2023"
}

export function getLambdaLanguageLabel(language: LambdaLanguage): string {
  switch (language) {
    case "typescript":
      return "TypeScript"
    case "python":
      return "Python"
    case "go":
      return "Go"
  }
}

export function clampMemoryMb(value: number): number {
  return Math.min(Math.max(value, LAMBDA_MEMORY_MIN_MB), LAMBDA_MEMORY_MAX_MB)
}

export function clampEphemeralStorageMb(value: number): number {
  return Math.min(Math.max(value, LAMBDA_EPHEMERAL_STORAGE_MIN_MB), LAMBDA_EPHEMERAL_STORAGE_MAX_MB)
}

export function getLambdaTimeoutLimits(unit: LambdaTimeoutUnit): LambdaTimeoutLimits {
  switch (unit) {
    case "minutes":
      return {
        min: Math.ceil(LAMBDA_TIMEOUT_MIN_SECONDS / 60),
        max: LAMBDA_TIMEOUT_MAX_SECONDS / 60,
      }
    default:
      return {
        min: LAMBDA_TIMEOUT_MIN_SECONDS,
        max: LAMBDA_TIMEOUT_MAX_SECONDS,
      }
  }
}

export function lambdaTimeoutToSeconds(value: number, unit: LambdaTimeoutUnit): number {
  return unit === "minutes" ? value * 60 : value
}

export function clampLambdaTimeoutValue(value: number, unit: LambdaTimeoutUnit): number {
  const limits = getLambdaTimeoutLimits(unit)
  return Math.min(Math.max(value, limits.min), limits.max)
}

export function validateMemoryMb(value: number): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for memory."
  }

  if (value < LAMBDA_MEMORY_MIN_MB || value > LAMBDA_MEMORY_MAX_MB) {
    return `Memory must be between ${LAMBDA_MEMORY_MIN_MB} MB and ${LAMBDA_MEMORY_MAX_MB} MB.`
  }

  return null
}

export function validateEphemeralStorageMb(value: number): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for ephemeral storage."
  }

  if (value < LAMBDA_EPHEMERAL_STORAGE_MIN_MB || value > LAMBDA_EPHEMERAL_STORAGE_MAX_MB) {
    return `Ephemeral storage must be between ${LAMBDA_EPHEMERAL_STORAGE_MIN_MB} MB and ${LAMBDA_EPHEMERAL_STORAGE_MAX_MB} MB.`
  }

  return null
}

export function validateLambdaTimeout(value: number, unit: LambdaTimeoutUnit): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for timeout."
  }

  const limits = getLambdaTimeoutLimits(unit)
  if (value < limits.min || value > limits.max) {
    return `Timeout must be between ${limits.min} and ${limits.max} ${unit}.`
  }

  const totalSeconds = lambdaTimeoutToSeconds(value, unit)
  if (totalSeconds < LAMBDA_TIMEOUT_MIN_SECONDS || totalSeconds > LAMBDA_TIMEOUT_MAX_SECONDS) {
    return "Timeout must be between 1 second and 15 minutes."
  }

  return null
}

export function validateEnvironmentVariableDraft(key: string): string | null {
  if (!key.trim()) {
    return "Environment variable key is required."
  }

  return null
}

export function getEnvironmentVariables(
  variables?: LambdaEnvironmentVariable[],
): LambdaEnvironmentVariable[] {
  return variables ?? []
}

export function validateLambdaFunctionConfig(
  config: LambdaFunctionConfig,
): LambdaFunctionConfigErrors {
  return {
    memory: validateMemoryMb(config.memoryMb),
    ephemeralStorage: validateEphemeralStorageMb(config.ephemeralStorageMb),
    timeout: validateLambdaTimeout(config.timeoutValue, config.timeoutUnit),
  }
}

export function clampLambdaFunctionConfig(config: LambdaFunctionConfig): LambdaFunctionConfig {
  return {
    ...config,
    memoryMb: clampMemoryMb(config.memoryMb),
    ephemeralStorageMb: clampEphemeralStorageMb(config.ephemeralStorageMb),
    timeoutValue: clampLambdaTimeoutValue(config.timeoutValue, config.timeoutUnit),
    environmentVariables: getEnvironmentVariables(config.environmentVariables).map((variable) => ({
      key: variable.key.trim(),
      value: variable.value,
    })),
  }
}

export function getLambdaFunctionConfig(data: LambdaFunctionConfigInput): LambdaFunctionConfig {
  const runtime = data.runtime ?? DEFAULT_LAMBDA_RUNTIME
  const defaultLanguage = getDefaultLanguageForRuntime(runtime)
  const timeoutUnit = data.timeoutUnit ?? DEFAULT_LAMBDA_TIMEOUT_UNIT

  return clampLambdaFunctionConfig({
    functionName: data.functionName ?? "",
    runtime,
    architecture: data.architecture ?? DEFAULT_LAMBDA_ARCHITECTURE,
    language: isCustomRuntimeLanguageSelection(runtime)
      ? (data.language ?? defaultLanguage)
      : defaultLanguage,
    memoryMb: data.memoryMb ?? DEFAULT_LAMBDA_MEMORY_MB,
    ephemeralStorageMb: data.ephemeralStorageMb ?? DEFAULT_LAMBDA_EPHEMERAL_STORAGE_MB,
    timeoutValue: data.timeoutValue ?? DEFAULT_LAMBDA_TIMEOUT_VALUE,
    timeoutUnit,
    environmentVariables: getEnvironmentVariables(data.environmentVariables),
  })
}
