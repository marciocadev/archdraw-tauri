import type { DiagramResources } from "../types"
import { renderSnsTopicConstruct } from "./infra/renderSnsTopicObject"

export const generateStackObject = (stackClassName: string, resources: DiagramResources) => {
  const snsConstructs = resources.snsTopics.map(renderSnsTopicConstruct).join("\n\n")
  const snsBlock = snsConstructs.length > 0 ? `\n${snsConstructs}\n` : "\n"

  return `import * as cdk from 'aws-cdk-lib/core';
${snsConstructs.length > 0 ? `import * as sns from 'aws-cdk-lib/aws-sns';` : ""}
import { Construct } from 'constructs';

export class ${stackClassName}Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props ?: cdk.StackProps) {
    super(scope, id, props);

${snsBlock}
  }
}
`
}