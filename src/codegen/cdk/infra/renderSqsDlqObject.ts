import type { SqsCdkContext } from "../buildSqsCdkContext"
import type { DiagramResources } from "../../types"
import { renderSqsQueueSettingsOptions } from "./renderSqsQueueSettingsOptions"

export const renderSqsDlqObject = (
  queue: DiagramResources["sqsDlqs"][number],
  context: SqsCdkContext,
) => {
  const identifiers = context.dlqs[queue.nodeId]
  const settingsOptions = renderSqsQueueSettingsOptions(queue)

  return `    const ${identifiers.variableName} = new sqs.Queue(this, '${identifiers.logicalId}', {
      queueName: '${identifiers.queueName}',${settingsOptions}
    });`
}
