import { getLambdaFunctionFolderName } from "../lambda/getLambdaAssetPath"
import type {
  LambdaArchitecture,
  LambdaLanguage,
  LambdaRuntime,
} from "../../../components/utils/lambdaFunctionTypes"
import { lambdaTimeoutToSeconds } from "../../../components/utils/lambdaFunctionTypes"
import type { DiagramLambdaFunction } from "../../types"
import { renderCdkDurationExpression } from "./renderCdkDuration"

const DEFAULT_MEMORY_MB = 128
const DEFAULT_EPHEMERAL_STORAGE_MB = 512
const DEFAULT_TIMEOUT_SECONDS = 3
const DEFAULT_ARCHITECTURE: LambdaArchitecture = "X86_64"

function escapeTsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

export function isNodejsLambdaRuntime(runtime: LambdaRuntime): boolean {
  return runtime === "nodejs-24"
}

export function renderLambdaRuntimeExpression(runtime: LambdaRuntime): string {
  switch (runtime) {
    case "nodejs-24":
      return "lambda.Runtime.NODEJS_24_X"
    case "python-3-14":
      return "lambda.Runtime.PYTHON_3_14"
    case "amazon-linux-2023":
      return "lambda.Runtime.PROVIDED_AL2023"
  }
}

export function renderLambdaArchitectureExpression(architecture: LambdaArchitecture): string {
  return architecture === "ARM_64"
    ? "lambda.Architecture.ARM_64"
    : "lambda.Architecture.X86_64"
}

function renderEnvironmentOption(
  environmentVariables: DiagramLambdaFunction["environmentVariables"],
): string {
  if (environmentVariables.length === 0) {
    return ""
  }

  const entries = environmentVariables
    .map((variable) => `'${escapeTsString(variable.key)}': '${escapeTsString(variable.value)}',`)
    .join("\n        ")

  return `\n      environment: {\n        ${entries}\n      },`
}

function renderMemoryOption(memoryMb: number): string {
  if (memoryMb === DEFAULT_MEMORY_MB) {
    return ""
  }

  return `\n      memorySize: ${memoryMb},`
}

function renderEphemeralStorageOption(ephemeralStorageMb: number): string {
  if (ephemeralStorageMb === DEFAULT_EPHEMERAL_STORAGE_MB) {
    return ""
  }

  return `\n      ephemeralStorageSize: cdk.Size.mebibytes(${ephemeralStorageMb}),`
}

function renderTimeoutOption(lambdaFunction: DiagramLambdaFunction): string {
  const timeoutSeconds = lambdaTimeoutToSeconds(
    lambdaFunction.timeoutValue,
    lambdaFunction.timeoutUnit,
  )

  if (timeoutSeconds === DEFAULT_TIMEOUT_SECONDS) {
    return ""
  }

  if (lambdaFunction.timeoutUnit === "minutes") {
    return `\n      timeout: ${renderCdkDurationExpression(lambdaFunction.timeoutValue, "minutes")},`
  }

  return `\n      timeout: ${renderCdkDurationExpression(lambdaFunction.timeoutValue, "seconds")},`
}

function renderArchitectureOption(architecture: LambdaArchitecture): string {
  if (architecture === DEFAULT_ARCHITECTURE) {
    return ""
  }

  return `\n      architecture: ${renderLambdaArchitectureExpression(architecture)},`
}

export function renderLambdaSharedOptions(lambdaFunction: DiagramLambdaFunction, fallback: string): string {
  return [
    `\n      functionName: '${escapeTsString(lambdaFunction.functionName.trim() || fallback)}',`,
    renderMemoryOption(lambdaFunction.memoryMb),
    renderEphemeralStorageOption(lambdaFunction.ephemeralStorageMb),
    renderTimeoutOption(lambdaFunction),
    renderArchitectureOption(lambdaFunction.architecture),
    renderEnvironmentOption(lambdaFunction.environmentVariables),
  ].join("")
}

function getNodejsEntryFileName(language: LambdaLanguage): string {
  return language === "typescript" ? "index.ts" : "index.js"
}

function renderNodejsEntryExpression(folderName: string, language: LambdaLanguage): string {
  const entryFile = getNodejsEntryFileName(language)
  return `path.join(__dirname, 'functions', '${escapeTsString(folderName)}', '${entryFile}')`
}

function renderFunctionCodeAssetExpression(folderName: string, language: LambdaLanguage): string {
  if (language === "go") {
    return `lambda.Code.fromAsset(path.join(__dirname, 'functions', '${escapeTsString(folderName)}', 'cmd'))`
  }

  return `lambda.Code.fromAsset(path.join(__dirname, 'functions', '${escapeTsString(folderName)}'))`
}

function getFunctionHandler(language: LambdaLanguage): string {
  switch (language) {
    case "python":
      return "index.handler"
    case "go":
      return "bootstrap"
    default:
      return "index.handler"
  }
}

export function renderNodejsLambdaFunctionConstruct(
  lambdaFunction: DiagramLambdaFunction,
  variableName: string,
  logicalId: string,
  fallback: string,
): string {
  const folderName = getLambdaFunctionFolderName(lambdaFunction.functionName, fallback)
  const entry = renderNodejsEntryExpression(folderName, lambdaFunction.language)
  const sharedOptions = renderLambdaSharedOptions(lambdaFunction, fallback)
  const runtime = renderLambdaRuntimeExpression(lambdaFunction.runtime)

  return `    const ${variableName} = new nodejs.NodejsFunction(this, '${logicalId}', {
      entry: ${entry},
      runtime: ${runtime},${sharedOptions}
    });
    ${variableName}.logGroup.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);`
}

export function renderLambdaFunctionConstruct(
  lambdaFunction: DiagramLambdaFunction,
  variableName: string,
  logicalId: string,
  fallback: string,
): string {
  const folderName = getLambdaFunctionFolderName(lambdaFunction.functionName, fallback)
  const sharedOptions = renderLambdaSharedOptions(lambdaFunction, fallback)
  const runtime = renderLambdaRuntimeExpression(lambdaFunction.runtime)
  const handler = getFunctionHandler(lambdaFunction.language)
  const codeAsset = renderFunctionCodeAssetExpression(folderName, lambdaFunction.language)

  return `    const ${variableName} = new lambda.Function(this, '${logicalId}', {
      runtime: ${runtime},
      handler: '${escapeTsString(handler)}',
      code: ${codeAsset},${sharedOptions}
    });
    ${variableName}.logGroup.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);`
}
