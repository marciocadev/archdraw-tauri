import type { DiagramResources } from "../../types"

export type LambdaTriggerSource = "sqs" | "sns" | "both" | "generic"

export function getLambdaTriggerSource(
  lambdaNodeId: string,
  resources: DiagramResources,
): LambdaTriggerSource {
  const hasSqs = resources.sqsLambdaEventSources.some(
    (eventSource) => eventSource.lambdaNodeId === lambdaNodeId,
  )
  const hasSns = resources.snsLambdaSubscriptions.some(
    (subscription) => subscription.lambdaNodeId === lambdaNodeId,
  )

  if (hasSqs && hasSns) {
    return "both"
  }

  if (hasSqs) {
    return "sqs"
  }

  if (hasSns) {
    return "sns"
  }

  return "generic"
}
