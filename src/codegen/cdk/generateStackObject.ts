import type { DiagramResources } from "../types"
import { renderSnsTopicConstruct } from "./infra/renderSnsTopicObject"
import { renderSqsDlqObject } from "./infra/renderSqsDlqObject"
import { renderSqsQueueObject } from "./infra/renderSqsQueueObject"

export const generateStackObject = (stackClassName: string, resources: DiagramResources) => {
  const snsConstructs = resources.snsTopics.map(renderSnsTopicConstruct).join("\n\n")
  const sqsQueueConstructs = resources.sqsQueues.map(renderSqsQueueObject).join("\n\n")
  const sqsDlqConstructs = resources.sqsDlqs.map(renderSqsDlqObject).join("\n\n")
  const resourceConstructs = [snsConstructs, sqsQueueConstructs, sqsDlqConstructs]
    .filter(Boolean)
    .join("\n\n")
  const resourceBlock = resourceConstructs.length > 0 ? `\n${resourceConstructs}\n` : "\n"

  const imports = [
    resources.snsTopics.length > 0 ? `import * as sns from 'aws-cdk-lib/aws-sns';` : "",
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
