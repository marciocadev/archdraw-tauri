import { toCamelCase, toPascalCase } from "../../sanitizeNames"
import type { DiagramResources } from "../../types"
import { renderSqsQueueSettingsOptions } from "./renderSqsQueueSettingsOptions"

export const renderSqsQueueObject = (
  queue: DiagramResources["sqsQueues"][number],
  index: number,
) => {
  const queueName = queue.queueName.trim() === "" ? `SqsDlq${index + 1}` : queue.queueName.trim()
  const logicalId = toPascalCase(queue.queueName, `SqsQueue${index + 1}`)
  const variableName = toCamelCase(queue.queueName, `sqsQueue${index + 1}`)
  const settingsOptions = renderSqsQueueSettingsOptions(queue)

  return `    const ${variableName} = new sqs.Queue(this, '${logicalId}', {
      queueName: '${queueName}',${settingsOptions}
    });`
}
