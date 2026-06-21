import { toCamelCase, toPascalCase } from "../../sanitizeNames"
import type { DiagramResources } from "../../types"

export const renderSnsTopicConstruct = (
  topic: DiagramResources["snsTopics"][number],
  index: number
) => {
  const topicName = topic.topicName.trim() === "" ? `SnsTopic${index + 1}` : topic.topicName.trim()
  const logicalId = toPascalCase(topic.topicName, `SnsTopic${index + 1}`)
  const variableName = toCamelCase(topic.topicName, `SnsTopic${index + 1}`)
  const fifoOption = topic.topicType === "fifo" ? "\n      fifo: true," : ""

  return `    const ${variableName} = new sns.Topic(this, '${logicalId}', {
      topicName: '${topicName}',${fifoOption}
    });`
}