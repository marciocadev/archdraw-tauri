import type { DiagramResources } from "../types"
import { buildLambdaCdkContext } from "./buildLambdaCdkContext"
import { buildSnsCdkContext } from "./buildSnsCdkContext"
import { buildSqsCdkContext } from "./buildSqsCdkContext"
import { renderLambdaFunctionConstructObject } from "./infra/renderLambdaFunctionObject"
import { isNodejsLambdaRuntime } from "./infra/renderLambdaFunctionOptions"
import { renderSnsLambdaSubscription } from "./infra/renderSnsLambdaSubscription"
import { renderSnsSqsSubscription } from "./infra/renderSnsSqsSubscription"
import { renderSnsTopicConstruct } from "./infra/renderSnsTopicObject"
import { renderSqsDlqObject } from "./infra/renderSqsDlqObject"
import { renderSqsLambdaEventSource } from "./infra/renderSqsLambdaEventSource"
import { renderSqsQueueObject } from "./infra/renderSqsQueueObject"

export const generateStackObject = (stackClassName: string, resources: DiagramResources) => {
  const snsContext = buildSnsCdkContext(resources)
  const lambdaContext = buildLambdaCdkContext(resources)
  const sqsContext = buildSqsCdkContext(resources)

  const snsConstructs = resources.snsTopics
    .map(renderSnsTopicConstruct)
    .join("\n\n")

  const lambdaConstructs = resources.lambdaFunctions
    .map((lambdaFunction, index) => renderLambdaFunctionConstructObject(lambdaFunction, lambdaContext, index))
    .filter(Boolean)
    .join("\n\n")

  const sqsDlqConstructs = resources.sqsDlqs
    .map((dlq) => renderSqsDlqObject(dlq, sqsContext))
    .join("\n\n")

  const sqsQueueConstructs = resources.sqsQueues
    .map((queue) => renderSqsQueueObject(queue, sqsContext))
    .join("\n\n")

  const snsSqsSubscriptionConstructs = resources.snsSqsSubscriptions
    .map((subscription) => renderSnsSqsSubscription(subscription, snsContext, sqsContext))
    .filter(Boolean)
    .join("\n\n")

  const snsLambdaSubscriptionConstructs = resources.snsLambdaSubscriptions
    .map((subscription) => renderSnsLambdaSubscription(subscription, snsContext, lambdaContext))
    .filter(Boolean)
    .join("\n\n")

  const sqsLambdaEventSourceConstructs = resources.sqsLambdaEventSources
    .map((eventSource) => renderSqsLambdaEventSource(eventSource, sqsContext, lambdaContext))
    .filter(Boolean)
    .join("\n\n")

  const resourceConstructs = [
    snsConstructs,
    lambdaConstructs,
    sqsDlqConstructs,
    sqsQueueConstructs,
    snsSqsSubscriptionConstructs,
    snsLambdaSubscriptionConstructs,
    sqsLambdaEventSourceConstructs,
  ]
    .filter(Boolean)
    .join("\n\n")

  const resourceBlock = resourceConstructs.length > 0 ? `\n${resourceConstructs}\n` : "\n"

  const hasLambdaFunctions = resources.lambdaFunctions.length > 0
  const hasNodejsLambdaFunctions = resources.lambdaFunctions.some((lambdaFunction) =>
    isNodejsLambdaRuntime(lambdaFunction.runtime),
  )
  const hasSnsLambdaSubscriptions = resources.snsLambdaSubscriptions.length > 0
  const hasSqsLambdaEventSources = resources.sqsLambdaEventSources.length > 0

  const imports = [
    resources.snsTopics.length > 0 || hasSnsLambdaSubscriptions
      ? `import * as sns from 'aws-cdk-lib/aws-sns';`
      : "",
    resources.snsSqsSubscriptions.length > 0 || hasSnsLambdaSubscriptions
      ? `import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';`
      : "",
    hasLambdaFunctions ? `import * as path from 'node:path';` : "",
    hasLambdaFunctions ? `import * as lambda from 'aws-cdk-lib/aws-lambda';` : "",
    hasNodejsLambdaFunctions ? `import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';` : "",
    hasSqsLambdaEventSources
      ? `import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';`
      : "",
    resources.sqsQueues.length > 0 || resources.sqsDlqs.length > 0 || hasSqsLambdaEventSources
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
