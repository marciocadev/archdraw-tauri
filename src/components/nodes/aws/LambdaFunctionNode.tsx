import type { NodeProps } from "@xyflow/react"
import { AwsComponentNodeBase } from "./AwsComponentNodeBase"
import type { LambdaFunctionNodeType } from "./awsComponentNodeTypes"

export type { LambdaFunctionNodeType } from "./awsComponentNodeTypes"

const COMPONENT_KEY = "aws-lambda"
const NODE_TYPE = "lambda-function" as const

export const LambdaFunctionNode = ({ id, data, selected }: NodeProps<LambdaFunctionNodeType>) => (
  <AwsComponentNodeBase
    id={id}
    data={data}
    selected={selected}
    nodeType={NODE_TYPE}
    componentKey={COMPONENT_KEY}
  />
)
