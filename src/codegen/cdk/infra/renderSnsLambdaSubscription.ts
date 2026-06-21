import type { LambdaCdkContext } from "../buildLambdaCdkContext"
import type { SnsCdkContext } from "../buildSnsCdkContext"
import type { DiagramSnsLambdaSubscription } from "../../types"

export function renderSnsLambdaSubscription(
  subscription: DiagramSnsLambdaSubscription,
  snsContext: SnsCdkContext,
  lambdaContext: LambdaCdkContext,
): string {
  const topicIdentifiers = snsContext.topics[subscription.topicNodeId]
  const lambdaIdentifiers = lambdaContext.functions[subscription.lambdaNodeId]

  if (!topicIdentifiers || !lambdaIdentifiers) {
    return ""
  }

  return `    ${topicIdentifiers.variableName}.addSubscription(new subs.LambdaSubscription(${lambdaIdentifiers.variableName}, {}));`
}
