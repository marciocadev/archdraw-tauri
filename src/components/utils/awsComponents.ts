import type { ColorMode } from "@xyflow/react"
import type { JSX } from "react";
import type { AwsComponentNodeTypeName } from "../nodes/aws/awsComponentNodeTypes"
import { LambdaFunctionSvg } from "../svg/aws/LambdaFunctionSvg"
import { SNSTopicSvg } from "../svg/aws/SNSTopicSvg";
import { SQSQueueSvg } from "../svg/aws/SQSQueueSvg";
import { SQSDeadLetterQueue } from "../svg/aws/SQSDeadLetterQueue";

export interface ConnectionRules {
  canConnectTo: string[];
  canReceiveFrom: string[];
}

export interface ComponentType {
  key: string;
  nodeType: AwsComponentNodeTypeName;
  type: string;
  component: string;
  svg: () => JSX.Element;
  hoverCss: string;
  borderColor: string;
  borderColorDark: string;
  haveTarget: boolean;
  haveSource: boolean;
  connections: ConnectionRules;
}

export const awsComponents: ComponentType[] = [
  {
    key: "aws-lambda",
    nodeType: "lambda-function",
    type: "Lambda Function",
    component: "Function",
    hoverCss: "hover:border-amber-500",
    borderColor: "#f59e0b",
    borderColorDark: "#fbbf24",
    haveTarget: true,
    haveSource: true,
    svg: LambdaFunctionSvg,
    connections: {
      canConnectTo: ["sns-topic", "sqs-queue"],
      canReceiveFrom: ["sns-topic", "sqs-queue"],
    },
  },
  {
    key: "sns-topic",
    nodeType: "sns-topic",
    type: "SNS Topic",
    component: "Topic",
    hoverCss: "hover:border-pink-500",
    borderColor: "#ec4899",
    borderColorDark: "#f472b6",
    haveTarget: true,
    haveSource: true,
    svg: SNSTopicSvg,
    connections: {
      canConnectTo: ["aws-lambda", "sqs-queue"],
      canReceiveFrom: ["aws-lambda"],
    },
  },
  {
    key: "sqs-queue",
    nodeType: "sqs-queue",
    type: "SQS Queue",
    component: "Queue",
    hoverCss: "hover:border-pink-500",
    borderColor: "#ec4899",
    borderColorDark: "#f472b6",
    haveTarget: true,
    haveSource: true,
    svg: SQSQueueSvg,
    connections: {
      canConnectTo: ["aws-lambda", "sqs-dlq"],
      canReceiveFrom: ["aws-lambda", "sns-topic"],
    },
  },
  {
    key: "sqs-dlq",
    nodeType: "sqs-dlq",
    type: "SQS Dead Letter Queue",
    component: "Dead Letter Queue",
    hoverCss: "hover:border-purple-500",
    borderColor: "#ec4899",
    borderColorDark: "#f472b6",
    haveTarget: true,
    haveSource: true,
    svg: SQSDeadLetterQueue,
    connections: {
      canConnectTo: [],
      canReceiveFrom: ["sqs-queue"],
    },
  },
]

export const awsComponentsByKey = Object.fromEntries(
  awsComponents.map((component) => [component.key, component]),
) as Record<string, ComponentType>

export const DND_MIME_TYPE = "application/x-architecture-component";

export function getNodeTypeForComponentKey(
  componentKey: string,
): AwsComponentNodeTypeName | undefined {
  return awsComponentsByKey[componentKey]?.nodeType
}

const DEFAULT_BORDER_COLOR = "#94a3b8"
const DEFAULT_BORDER_COLOR_DARK = "#1e293b"

export function getComponentBorderColor(
  componentKey: string | undefined,
  colorMode: ColorMode,
): string {
  const component = componentKey ? awsComponentsByKey[componentKey] : undefined

  if (!component) {
    return colorMode === "dark" ? DEFAULT_BORDER_COLOR_DARK : DEFAULT_BORDER_COLOR
  }

  return colorMode === "dark" ? component.borderColorDark : component.borderColor
}