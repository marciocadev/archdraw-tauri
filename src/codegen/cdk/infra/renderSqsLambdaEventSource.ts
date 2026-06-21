import type { LambdaCdkContext } from "../buildLambdaCdkContext"
import type { SqsCdkContext } from "../buildSqsCdkContext"
import type { DiagramSqsLambdaEventSource } from "../../types"

export function renderSqsLambdaEventSource(
  eventSource: DiagramSqsLambdaEventSource,
  sqsContext: SqsCdkContext,
  lambdaContext: LambdaCdkContext,
): string {
  const queueIdentifiers = sqsContext.queues[eventSource.queueNodeId]
  const lambdaIdentifiers = lambdaContext.functions[eventSource.lambdaNodeId]

  if (!queueIdentifiers || !lambdaIdentifiers) {
    return ""
  }

  return `    ${lambdaIdentifiers.variableName}.addEventSource(new lambdaEventSources.SqsEventSource(${queueIdentifiers.variableName}));`
}
