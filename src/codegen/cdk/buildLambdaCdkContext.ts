import { toCamelCase, toPascalCase } from "../sanitizeNames"
import type { DiagramResources } from "../types"

export interface LambdaCdkIdentifiers {
  variableName: string
  logicalId: string
  functionName: string
}

export interface LambdaCdkContext {
  functions: Record<string, LambdaCdkIdentifiers>
}

export function buildLambdaCdkContext(resources: DiagramResources): LambdaCdkContext {
  const functions: Record<string, LambdaCdkIdentifiers> = {}

  resources.lambdaFunctions.forEach((lambdaFunction, index) => {
    const fallback = `LambdaFunction${index + 1}`
    functions[lambdaFunction.nodeId] = {
      variableName: toCamelCase(lambdaFunction.functionName, fallback),
      logicalId: toPascalCase(lambdaFunction.functionName, fallback),
      functionName: lambdaFunction.functionName.trim() || fallback,
    }
  })

  return { functions }
}
