import type { JSX } from "react";
import { LambdaFunctionSvg } from "../svg/aws/LambdaFunctionSvg"
import { SNSTopicSvg } from "../svg/aws/SNSTopicSvg";

export interface ComponentType {
  key: string;
  type: string;
  component: string;
  svg: () => JSX.Element;
  hoverCss: string;
}

export const awsComponents: ComponentType[] = [
  {
    key: "aws-lambda",
    type: "Lambda Function",
    component: "Function",
    hoverCss: "hover:border-amber-500",
    svg: LambdaFunctionSvg
  },
  {
    key: "sns-topic",
    type: "SNS Topic",
    component: "Topic",
    hoverCss: "hover:border-pink-500",
    svg: SNSTopicSvg
  }
]

export const awsComponentsByKey = Object.fromEntries(
  awsComponents.map((component) => [component.key, component]),
) as Record<string, ComponentType>

export const DND_MIME_TYPE = "application/x-architecture-component";