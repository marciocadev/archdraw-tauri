import type { SqsCdkContext } from "../buildSqsCdkContext"
import type { DiagramResources } from "../../types"
import { DEFAULT_MAX_RECEIVE_COUNT } from "../../../components/utils/dlqConnectionTypes"
import { renderSqsQueueSettingsOptions } from "./renderSqsQueueSettingsOptions"

function renderDeadLetterQueueOption(
  queue: DiagramResources["sqsQueues"][number],
  context: SqsCdkContext,
): string {
  if (!queue.deadLetterQueueNodeId) {
    return ""
  }

  const dlqIdentifiers = context.dlqs[queue.deadLetterQueueNodeId]
  if (!dlqIdentifiers) {
    return ""
  }

  return `\n      deadLetterQueue: {
        queue: ${dlqIdentifiers.variableName},
        maxReceiveCount: ${queue.maxReceiveCount ?? DEFAULT_MAX_RECEIVE_COUNT},
      },`
}

export const renderSqsQueueObject = (
  queue: DiagramResources["sqsQueues"][number],
  context: SqsCdkContext,
) => {
  const identifiers = context.queues[queue.nodeId]
  const settingsOptions = renderSqsQueueSettingsOptions(queue)
  const deadLetterQueueOption = renderDeadLetterQueueOption(queue, context)

  return `    const ${identifiers.variableName} = new sqs.Queue(this, '${identifiers.logicalId}', {
      queueName: '${identifiers.queueName}',${settingsOptions}${deadLetterQueueOption}
    });`
}
