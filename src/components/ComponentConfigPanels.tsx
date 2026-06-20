import type { AwsComponentNodeType } from "./nodes/aws/awsComponentNodeTypes"
import { LambdaFunctionConfigPanel } from "./LambdaFunctionConfigPanel"
import { SnsTopicConfigPanel } from "./SnsTopicConfigPanel"
import { SqsDlqConfigPanel } from "./SqsDlqConfigPanel"
import { SqsQueueConfigPanel } from "./SqsQueueConfigPanel"
import { getLambdaFunctionConfig, type LambdaFunctionConfig } from "./utils/lambdaFunctionTypes"
import { getSnsTopicConfig, type SnsTopicConfig } from "./utils/snsTopicTypes"
import { getSqsDlqConfig, type SqsDlqConfig } from "./utils/sqsDlqTypes"
import { getSqsQueueConfig, type SqsQueueConfig } from "./utils/sqsQueueTypes"

export interface ComponentConfigPanelsProps {
  configuringNode: AwsComponentNodeType | undefined
  isOpen: boolean
  onCancel: () => void
  onConfirmLambda: (config: LambdaFunctionConfig) => void
  onConfirmSns: (config: SnsTopicConfig) => void
  onConfirmSqsQueue: (config: SqsQueueConfig) => void
  onConfirmSqsDlq: (config: SqsDlqConfig) => void
}

export const ComponentConfigPanels = (props: ComponentConfigPanelsProps) => {
  const {
    configuringNode,
    isOpen,
    onCancel,
    onConfirmLambda,
    onConfirmSns,
    onConfirmSqsQueue,
    onConfirmSqsDlq,
  } = props

  if (!configuringNode) {
    return null
  }

  switch (configuringNode.type) {
    case "lambda-function":
      return (
        <LambdaFunctionConfigPanel
          isOpen={isOpen}
          initialConfig={getLambdaFunctionConfig(configuringNode.data)}
          onConfirm={onConfirmLambda}
          onCancel={onCancel}
        />
      )
    case "sns-topic":
      return (
        <SnsTopicConfigPanel
          isOpen={isOpen}
          initialConfig={getSnsTopicConfig(configuringNode.data)}
          onConfirm={onConfirmSns}
          onCancel={onCancel}
        />
      )
    case "sqs-queue":
      return (
        <SqsQueueConfigPanel
          isOpen={isOpen}
          initialConfig={getSqsQueueConfig(configuringNode.data)}
          onConfirm={onConfirmSqsQueue}
          onCancel={onCancel}
        />
      )
    case "sqs-dlq":
      return (
        <SqsDlqConfigPanel
          isOpen={isOpen}
          initialConfig={getSqsDlqConfig(configuringNode.data)}
          onConfirm={onConfirmSqsDlq}
          onCancel={onCancel}
        />
      )
    default:
      return null
  }
}
