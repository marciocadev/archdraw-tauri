import type { TerraformContext } from "../buildTerraformContext"
import type { DiagramResources } from "../../types"
import { renderTerraformMessageBodyFilterPolicy } from "./renderMessageBodyFilterPolicy"

function renderSqsQueuePolicyForSns(
  subscriptionResourceName: string,
  queueResourceName: string,
  topicResourceName: string,
): string {
  return `data "aws_iam_policy_document" "${subscriptionResourceName}_sqs_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    actions = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.${queueResourceName}.arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.${topicResourceName}.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "${subscriptionResourceName}_sqs_policy" {
  queue_url = aws_sqs_queue.${queueResourceName}.id
  policy    = data.aws_iam_policy_document.${subscriptionResourceName}_sqs_policy.json
}`
}

export function renderSnsSqsSubscriptions(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.snsSqsSubscriptions.map((subscription, index) => {
    const topicIdentifiers = context.snsTopics[subscription.topicNodeId]
    const queueIdentifiers = context.sqsQueues[subscription.queueNodeId]
    const resourceName = `${topicIdentifiers.resourceName}_to_${queueIdentifiers.resourceName}_${index + 1}`
    const rawMessageDelivery = subscription.rawMessageDelivery
      ? "\n  raw_message_delivery = true"
      : ""
    const filterPolicy = renderTerraformMessageBodyFilterPolicy(subscription.messageBodyFilters)
    const queuePolicy = renderSqsQueuePolicyForSns(
      resourceName,
      queueIdentifiers.resourceName,
      topicIdentifiers.resourceName,
    )

    return `${queuePolicy}

resource "aws_sns_topic_subscription" "${resourceName}" {
  topic_arn = aws_sns_topic.${topicIdentifiers.resourceName}.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.${queueIdentifiers.resourceName}.arn${rawMessageDelivery}${filterPolicy}
}`
  }).join("\n\n")
}

export function renderSnsLambdaSubscriptions(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.snsLambdaSubscriptions.map((subscription, index) => {
    const topicIdentifiers = context.snsTopics[subscription.topicNodeId]
    const lambdaIdentifiers = context.lambdaFunctions[subscription.lambdaNodeId]
    const resourceName = `${topicIdentifiers.resourceName}_to_${lambdaIdentifiers.resourceName}_${index + 1}`

    return `resource "aws_sns_topic_subscription" "${resourceName}" {
  topic_arn = aws_sns_topic.${topicIdentifiers.resourceName}.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.${lambdaIdentifiers.resourceName}.arn
}

resource "aws_lambda_permission" "${resourceName}" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.${lambdaIdentifiers.resourceName}.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.${topicIdentifiers.resourceName}.arn
}`
  }).join("\n\n")
}

export function renderSqsLambdaEventSources(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return resources.sqsLambdaEventSources.map((eventSource, index) => {
    const queueIdentifiers = context.sqsQueues[eventSource.queueNodeId]
    const lambdaIdentifiers = context.lambdaFunctions[eventSource.lambdaNodeId]
    const resourceName = `${queueIdentifiers.resourceName}_to_${lambdaIdentifiers.resourceName}_${index + 1}`

    return `resource "aws_lambda_event_source_mapping" "${resourceName}" {
  event_source_arn = aws_sqs_queue.${queueIdentifiers.resourceName}.arn
  function_name    = aws_lambda_function.${lambdaIdentifiers.resourceName}.arn
  batch_size       = 10
}`
  }).join("\n\n")
}

export function renderAllSubscriptions(
  resources: DiagramResources,
  context: TerraformContext,
): string {
  return [
    renderSnsSqsSubscriptions(resources, context),
    renderSnsLambdaSubscriptions(resources, context),
    renderSqsLambdaEventSources(resources, context),
  ].filter(Boolean).join("\n\n")
}
