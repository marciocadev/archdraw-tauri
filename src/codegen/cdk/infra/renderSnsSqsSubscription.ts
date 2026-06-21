import type { SnsCdkContext } from "../buildSnsCdkContext"
import type { SqsCdkContext } from "../buildSqsCdkContext"
import type { DiagramSnsSqsSubscription } from "../../types"
import { renderMessageBodyFilterPolicy } from "./renderMessageBodyFilterPolicy"

export function renderSnsSqsSubscription(
  subscription: DiagramSnsSqsSubscription,
  snsContext: SnsCdkContext,
  sqsContext: SqsCdkContext,
): string {
  const topicIdentifiers = snsContext.topics[subscription.topicNodeId]
  const queueIdentifiers = sqsContext.queues[subscription.queueNodeId]

  if (!topicIdentifiers || !queueIdentifiers) {
    return ""
  }

  const rawMessageDeliveryOption = subscription.rawMessageDelivery
    ? "\n      rawMessageDelivery: true,"
    : ""
  const filterPolicyOption = renderMessageBodyFilterPolicy(subscription.messageBodyFilters)

  return `    ${topicIdentifiers.variableName}.addSubscription(new subs.SqsSubscription(${queueIdentifiers.variableName}, {${rawMessageDeliveryOption}${filterPolicyOption}
    }));`
}
