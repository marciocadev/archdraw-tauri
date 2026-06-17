import type { ColorMode } from "@xyflow/react"
import type { JSX } from "react";
import { LambdaFunctionSvg } from "../svg/aws/LambdaFunctionSvg"
import { SNSTopicSvg } from "../svg/aws/SNSTopicSvg";

export interface ConnectionRules {
  canConnectTo: string[];
  canReceiveFrom: string[];
}

export interface ComponentType {
  key: string;
  type: string;
  component: string;
  svg: () => JSX.Element;
  hoverCss: string;
  borderColor: string;
  borderColorDark: string;
  connections: ConnectionRules;
}

export const awsComponents: ComponentType[] = [
  {
    key: "aws-lambda",
    type: "Lambda Function",
    component: "Function",
    hoverCss: "hover:border-amber-500",
    borderColor: "#f59e0b",
    borderColorDark: "#fbbf24",
    svg: LambdaFunctionSvg,
    connections: {
      canConnectTo: ["sns-topic"],
      canReceiveFrom: ["sns-topic"],
    },
  },
  {
    key: "sns-topic",
    type: "SNS Topic",
    component: "Topic",
    hoverCss: "hover:border-pink-500",
    borderColor: "#ec4899",
    borderColorDark: "#f472b6",
    svg: SNSTopicSvg,
    connections: {
      canConnectTo: ["aws-lambda"],
      canReceiveFrom: ["aws-lambda"],
    },
  },
]

export const awsComponentsByKey = Object.fromEntries(
  awsComponents.map((component) => [component.key, component]),
) as Record<string, ComponentType>

export const DND_MIME_TYPE = "application/x-architecture-component";

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