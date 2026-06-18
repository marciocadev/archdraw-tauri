import type { NodeProps } from "@xyflow/react"
import { AwsComponentNodeBase } from "./AwsComponentNodeBase"
import type { SNSTopicNodeType } from "./awsComponentNodeTypes"

export type { SNSTopicNodeType } from "./awsComponentNodeTypes"

const COMPONENT_KEY = "sns-topic"
const NODE_TYPE = "sns-topic" as const

export const SNSTopicNode = ({ id, data, selected }: NodeProps<SNSTopicNodeType>) => (
  <AwsComponentNodeBase
    id={id}
    data={data}
    selected={selected}
    nodeType={NODE_TYPE}
    componentKey={COMPONENT_KEY}
  />
)
