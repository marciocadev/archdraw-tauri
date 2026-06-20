export interface SqsQueueConfig {
  queueName: string
}

export function getSqsQueueConfig(data: {
  queueName?: string
}): SqsQueueConfig {
  return {
    queueName: data.queueName ?? "",
  }
}
