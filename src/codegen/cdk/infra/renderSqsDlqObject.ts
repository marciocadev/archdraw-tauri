import { toCamelCase, toPascalCase } from "../../sanitizeNames"
import type { DiagramResources } from "../../types"
import { renderSqsQueueSettingsOptions } from "./renderSqsQueueSettingsOptions"

export const renderSqsDlqObject = (
  queue: DiagramResources["sqsDlqs"][number],
  index: number,
) => {
  const dlqName = queue.dlqName.trim() === "" ? `SqsDlq${index + 1}` : queue.dlqName.trim()
  const logicalId = toPascalCase(queue.dlqName, `SqsDlq${index + 1}`)
  const variableName = toCamelCase(queue.dlqName, `sqsDlq${index + 1}`)
  const settingsOptions = renderSqsQueueSettingsOptions(queue)

  return `    const ${variableName} = new sqs.Queue(this, '${logicalId}', {
      queueName: '${queue.dlqName}',${settingsOptions}
    });`
}
