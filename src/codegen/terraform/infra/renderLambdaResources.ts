import type { TerraformContext } from "../buildTerraformContext"
import type { DiagramResources } from "../../types"
import {
  isNodejsLambdaRuntime,
} from "../../cdk/infra/renderLambdaFunctionOptions"
import type { LambdaLanguage, LambdaRuntime } from "../../../components/utils/lambdaFunctionTypes"
import { lambdaTimeoutToSeconds } from "../../../components/utils/lambdaFunctionTypes"
import { getLambdaFunctionFolderName } from "../../cdk/lambda/getLambdaAssetPath"
import { escapeTerraformString } from "./escapeTerraformString"

const DEFAULT_MEMORY_MB = 128
const DEFAULT_EPHEMERAL_STORAGE_MB = 512
const DEFAULT_TIMEOUT_SECONDS = 3

function renderLambdaRuntime(runtime: LambdaRuntime): string {
  switch (runtime) {
    case "nodejs-24":
      return "nodejs24.x"
    case "python-3-14":
      return "python3.14"
    case "amazon-linux-2023":
      return "provided.al2023"
  }
}

function renderLambdaHandler(language: LambdaLanguage, isNodejs: boolean): string {
  if (isNodejs) {
    return "index.handler"
  }

  switch (language) {
    case "python":
      return "index.handler"
    case "go":
      return "bootstrap"
    default:
      return "index.handler"
  }
}

function renderLambdaArchitecture(architecture: "ARM_64" | "X86_64"): string | null {
  return architecture === "ARM_64" ? '["arm64"]' : null
}

function renderLambdaOptionalAttributes(
  lambdaFunction: DiagramResources["lambdaFunctions"][number],
): string {
  const attributes: string[] = []
  const timeoutSeconds = lambdaTimeoutToSeconds(
    lambdaFunction.timeoutValue,
    lambdaFunction.timeoutUnit,
  )

  if (lambdaFunction.memoryMb !== DEFAULT_MEMORY_MB) {
    attributes.push(`  memory_size = ${lambdaFunction.memoryMb}`)
  }

  if (timeoutSeconds !== DEFAULT_TIMEOUT_SECONDS) {
    attributes.push(`  timeout     = ${timeoutSeconds}`)
  }

  if (lambdaFunction.ephemeralStorageMb !== DEFAULT_EPHEMERAL_STORAGE_MB) {
    attributes.push(`  ephemeral_storage {
    size = ${lambdaFunction.ephemeralStorageMb}
  }`)
  }

  const architecture = renderLambdaArchitecture(lambdaFunction.architecture)
  if (architecture) {
    attributes.push(`  architectures = ${architecture}`)
  }

  if (lambdaFunction.environmentVariables.length > 0) {
    const variables = lambdaFunction.environmentVariables
      .map((variable) => `      ${variable.key} = "${escapeTerraformString(variable.value)}"`)
      .join("\n")

    attributes.push(`  environment {
    variables = {
${variables}
    }
  }`)
  }

  return attributes.length > 0 ? `\n${attributes.join("\n")}` : ""
}

function renderLambdaArchiveSourceDir(folderName: string, isGo: boolean): string {
  if (isGo) {
    return `"\${path.module}/functions/${escapeTerraformString(folderName)}/cmd"`
  }

  return `"\${path.module}/functions/${escapeTerraformString(folderName)}"`
}

function lambdaHasSqsTrigger(
  lambdaNodeId: string,
  resources: DiagramResources,
): boolean {
  return resources.sqsLambdaEventSources.some(
    (eventSource) => eventSource.lambdaNodeId === lambdaNodeId,
  )
}

export function renderLambdaFunctions(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.lambdaFunctions.map((lambdaFunction, index) => {
    const identifiers = context.lambdaFunctions[lambdaFunction.nodeId]
    const fallback = `LambdaFunction${index + 1}`
    const folderName = getLambdaFunctionFolderName(lambdaFunction.functionName, fallback)
    const isNodejs = isNodejsLambdaRuntime(lambdaFunction.runtime)
    const isGo = lambdaFunction.language === "go"
    const hasSqsTrigger = lambdaHasSqsTrigger(lambdaFunction.nodeId, resources)
    const optionalAttributes = renderLambdaOptionalAttributes(lambdaFunction)
    const sqsPolicyAttachment = hasSqsTrigger
      ? `\n\nresource "aws_iam_role_policy_attachment" "${identifiers.resourceName}_sqs" {
  role       = aws_iam_role.${identifiers.resourceName}.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}`
      : ""

    return `data "archive_file" "${identifiers.resourceName}" {
  type        = "zip"
  source_dir  = ${renderLambdaArchiveSourceDir(folderName, isGo)}
  output_path = "\${path.module}/build/${identifiers.resourceName}.zip"
}

resource "aws_iam_role" "${identifiers.resourceName}" {
  name = "${escapeTerraformString(identifiers.displayName)}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "${identifiers.resourceName}_basic" {
  role       = aws_iam_role.${identifiers.resourceName}.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}${sqsPolicyAttachment}

resource "aws_lambda_function" "${identifiers.resourceName}" {
  function_name = "${escapeTerraformString(identifiers.displayName)}"
  role          = aws_iam_role.${identifiers.resourceName}.arn
  runtime       = "${renderLambdaRuntime(lambdaFunction.runtime)}"
  handler       = "${renderLambdaHandler(lambdaFunction.language, isNodejs)}"
  filename      = data.archive_file.${identifiers.resourceName}.output_path
  source_code_hash = data.archive_file.${identifiers.resourceName}.output_base64sha256${optionalAttributes}
}`
  }).join("\n\n")
}

export function renderLambdaOutputs(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.lambdaFunctions.map((lambdaFunction, index) => {
    const identifiers = context.lambdaFunctions[lambdaFunction.nodeId]
    return `output "${identifiers.resourceName}_arn" {
  description = "ARN of Lambda function ${lambdaFunction.functionName || `function-${index + 1}`}"
  value       = aws_lambda_function.${identifiers.resourceName}.arn
}`
  }).join("\n\n")
}
