import { isNodejsLambdaRuntime } from "../../cdk/infra/renderLambdaFunctionOptions"
import { getLambdaTriggerSource, type LambdaTriggerSource } from "../../cdk/lambda/lambdaTriggerSource"
import { getLambdaFunctionTerraformRelativePath } from "../../cdk/lambda/getLambdaAssetPath"
import type { DiagramResources, ProjectFile } from "../../types"

function renderJavaScriptHandler(functionName: string, triggerSource: LambdaTriggerSource): string {
  switch (triggerSource) {
    case "sqs":
      return `exports.handler = async (event) => {
  for (const record of event.Records) {
    console.log("SQS message received by ${functionName}:", record.body)
  }

  return {
    batchItemFailures: [],
  }
}
`
    case "sns":
      return `exports.handler = async (event) => {
  for (const record of event.Records) {
    console.log("SNS message received by ${functionName}:", record.Sns.Message)
  }
}
`
    case "both":
      return `exports.handler = async (event) => {
  const isSqsEvent = event.Records?.[0]?.eventSource === "aws:sqs"

  if (isSqsEvent) {
    for (const record of event.Records) {
      console.log("SQS message received by ${functionName}:", record.body)
    }
    return { batchItemFailures: [] }
  }

  for (const record of event.Records) {
    console.log("SNS message received by ${functionName}:", record.Sns.Message)
  }
}
`
    default:
      return `exports.handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({
    message: "Hello from ${functionName}!",
  }),
})
`
  }
}

function renderPythonHandler(functionName: string, triggerSource: LambdaTriggerSource): string {
  switch (triggerSource) {
    case "sqs":
      return `def handler(event, context):
    for record in event.get("Records", []):
        print(f"SQS message received by ${functionName}:", record.get("body"))
`
    case "sns":
      return `def handler(event, context):
    for record in event.get("Records", []):
        print(f"SNS message received by ${functionName}:", record.get("Sns", {}).get("Message"))
`
    case "both":
      return `def handler(event, context):
    for record in event.get("Records", []):
        if record.get("eventSource") == "aws:sqs":
            print(f"SQS message received by ${functionName}:", record.get("body"))
        elif record.get("EventSource") == "aws:sns":
            print(f"SNS message received by ${functionName}:", record.get("Sns", {}).get("Message"))
`
    default:
      return `def handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello from ${functionName}!",
    }
`
  }
}

function renderGoMain(functionName: string, triggerSource: LambdaTriggerSource): string {
  switch (triggerSource) {
    case "sqs":
      return `package main

import (
\t"context"
\t"fmt"

\t"github.com/aws/aws-lambda-go/events"
\t"github.com/aws/aws-lambda-go/lambda"
)

func handleRequest(ctx context.Context, event events.SQSEvent) (events.SQSEventResponse, error) {
\tfor _, record := range event.Records {
\t\tfmt.Printf("SQS message received by ${functionName}: %s\\n", record.Body)
\t}
\treturn events.SQSEventResponse{
\t\tBatchItemFailures: []events.SQSBatchItemFailure{},
\t}, nil
}

func main() {
\tlambda.Start(handleRequest)
}
`
    case "sns":
      return `package main

import (
\t"context"
\t"fmt"

\t"github.com/aws/aws-lambda-go/events"
\t"github.com/aws/aws-lambda-go/lambda"
)

func handleRequest(ctx context.Context, event events.SNSEvent) error {
\tfor _, record := range event.Records {
\t\tfmt.Printf("SNS message received by ${functionName}: %s\\n", record.SNS.Message)
\t}
\treturn nil
}

func main() {
\tlambda.Start(handleRequest)
}
`
    default:
      return `package main

import (
\t"context"
\t"encoding/json"

\t"github.com/aws/aws-lambda-go/lambda"
)

type Response struct {
\tStatusCode int    \`json:"statusCode"\`
\tBody       string \`json:"body"\`
}

func handleRequest(ctx context.Context) (Response, error) {
\treturn Response{
\t\tStatusCode: 200,
\t\tBody:       "Hello from ${functionName}!",
\t}, nil
}

func main() {
\tlambda.Start(handleRequest)
}
`
  }
}

function renderGoMod(): string {
  return `module archdraw-lambda

go 1.22

require github.com/aws/aws-lambda-go v1.47.0
`
}

function renderGoMakefile(): string {
  return `.PHONY: build build-arm64 build-amd64

build: build-amd64

build-amd64:
\tmkdir -p cmd
\tGOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -tags lambda.norpc -o cmd/bootstrap .

build-arm64:
\tmkdir -p cmd
\tGOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o cmd/bootstrap .
`
}

export function generateTerraformLambdaAssetFiles(resources: DiagramResources): ProjectFile[] {
  const files: ProjectFile[] = []

  resources.lambdaFunctions.forEach((lambdaFunction, index) => {
    const fallback = `LambdaFunction${index + 1}`
    const assetPath = getLambdaFunctionTerraformRelativePath(lambdaFunction.functionName, fallback)
    const displayName = lambdaFunction.functionName.trim() || fallback
    const triggerSource = getLambdaTriggerSource(lambdaFunction.nodeId, resources)

    if (isNodejsLambdaRuntime(lambdaFunction.runtime)) {
      files.push({
        relativePath: `${assetPath}/index.js`,
        content: renderJavaScriptHandler(displayName, triggerSource),
      })
      return
    }

    if (lambdaFunction.language === "python") {
      files.push({
        relativePath: `${assetPath}/index.py`,
        content: renderPythonHandler(displayName, triggerSource),
      })
      return
    }

    if (lambdaFunction.language === "go") {
      files.push(
        {
          relativePath: `${assetPath}/main.go`,
          content: renderGoMain(displayName, triggerSource),
        },
        {
          relativePath: `${assetPath}/go.mod`,
          content: renderGoMod(),
        },
        {
          relativePath: `${assetPath}/Makefile`,
          content: renderGoMakefile(),
        },
      )
    }
  })

  return files
}
