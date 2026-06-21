import type { LambdaCdkContext } from "../buildLambdaCdkContext"
import type { DiagramResources } from "../../types"
import {
  isNodejsLambdaRuntime,
  renderLambdaFunctionConstruct,
  renderNodejsLambdaFunctionConstruct,
} from "./renderLambdaFunctionOptions"

export function renderLambdaFunctionConstructObject(
  lambdaFunction: DiagramResources["lambdaFunctions"][number],
  context: LambdaCdkContext,
  index: number,
): string {
  const identifiers = context.functions[lambdaFunction.nodeId]
  if (!identifiers) {
    return ""
  }

  const fallback = `LambdaFunction${index + 1}`

  if (isNodejsLambdaRuntime(lambdaFunction.runtime)) {
    return renderNodejsLambdaFunctionConstruct(
      lambdaFunction,
      identifiers.variableName,
      identifiers.logicalId,
      fallback,
    )
  }

  return renderLambdaFunctionConstruct(
    lambdaFunction,
    identifiers.variableName,
    identifiers.logicalId,
    fallback,
  )
}
