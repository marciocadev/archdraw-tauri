import type { NodeProps } from "@xyflow/react"
import { AwsComponentNodeBase } from "./AwsComponentNodeBase"
import type { SQSDeadLetterQueueNodeType } from "./awsComponentNodeTypes"

export type { SQSDeadLetterQueueNodeType } from "./awsComponentNodeTypes"

const COMPONENT_KEY = "sqs-dlq"
const NODE_TYPE = "sqs-dlq" as const

export const SQSDeadLetterQueueNode = ({ id, data, selected }: NodeProps<SQSDeadLetterQueueNodeType>) => (
  <AwsComponentNodeBase
    id={id}
    data={data}
    selected={selected}
    nodeType={NODE_TYPE}
    componentKey={COMPONENT_KEY}
    componentLabel={data.dlqName || undefined}
  />
)
