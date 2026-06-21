import type { DiagramResources } from "../types"
import { buildSnsCdkContext } from "./buildSnsCdkContext"
import { buildSqsCdkContext } from "./buildSqsCdkContext"
import { renderSnsSqsSubscription } from "./infra/renderSnsSqsSubscription"
import { renderSnsTopicConstruct } from "./infra/renderSnsTopicObject"
import { renderSqsDlqObject } from "./infra/renderSqsDlqObject"
import { renderSqsQueueObject } from "./infra/renderSqsQueueObject"

export const generateStackObject = (stackClassName: string, resources: DiagramResources) => {
  // Build contexts
  const snsContext = buildSnsCdkContext(resources)
  const sqsContext = buildSqsCdkContext(resources)
  // Topics
  const snsConstructs = resources.snsTopics
    .map(renderSnsTopicConstruct)
    .join("\n\n")
  // DLQs
  const sqsDlqConstructs = resources.sqsDlqs
    .map((dlq) => renderSqsDlqObject(dlq, sqsContext))
    .join("\n\n")
  // Queues
  const sqsQueueConstructs = resources.sqsQueues
    .map((queue) => renderSqsQueueObject(queue, sqsContext))
    .join("\n\n")
  // Subscriptions
  const snsSqsSubscriptionConstructs = resources.snsSqsSubscriptions
    .map((subscription) => renderSnsSqsSubscription(subscription, snsContext, sqsContext))
    .filter(Boolean)
    .join("\n\n")
  // Resource constructs
  const resourceConstructs = [
    snsConstructs,
    sqsDlqConstructs,
    sqsQueueConstructs,
    snsSqsSubscriptionConstructs,
  ]
    .filter(Boolean)
    .join("\n\n")
  const resourceBlock = resourceConstructs.length > 0 ? `\n${resourceConstructs}\n` : "\n"

  // Imports
  const imports = [
    resources.snsTopics.length > 0 ? `import * as sns from 'aws-cdk-lib/aws-sns';` : "",
    resources.snsSqsSubscriptions.length > 0
      ? `import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';`
      : "",
    resources.sqsQueues.length > 0 || resources.sqsDlqs.length > 0
      ? `import * as sqs from 'aws-cdk-lib/aws-sqs';`
      : "",
  ].filter(Boolean).join("\n")

  return `import * as cdk from 'aws-cdk-lib/core';
${imports}
import { Construct } from 'constructs';

export class ${stackClassName}Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props ?: cdk.StackProps) {
    super(scope, id, props);

${resourceBlock}
  }
}
`
}
