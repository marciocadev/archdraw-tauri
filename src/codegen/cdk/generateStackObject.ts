import { toCamelCase, toPascalCase } from "../sanitizeNames"
import type { DiagramResources } from "../types"

const renderSnsTopicConstruct = (topic: DiagramResources["snsTopics"][number], index: number) => {
  const logicalId = toPascalCase(topic.topicName, `SnsTopic${index + 1}`)
  const variableName = toCamelCase(topic.topicName, `SnsTopic${index + 1}`)
  const fifoOption = topic.topicType === "fifo" ? "\n      fifo: true," : ""

  return `    const ${variableName} = new sns.Topic(this, '${logicalId}', {
      topicName: '${topic.topicName}',${fifoOption}
    });`
}

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