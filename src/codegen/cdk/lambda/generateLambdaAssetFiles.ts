import { isNodejsLambdaRuntime } from "../infra/renderLambdaFunctionOptions"
import type { DiagramLambdaFunction, ProjectFile } from "../../types"
import { getLambdaFunctionLibRelativePath } from "./getLambdaAssetPath"

function renderTypeScriptHandler(functionName: string): string {
  return `export const handler = async (): Promise<{ statusCode: number; body: string }> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from ${functionName}!",
    }),
  }
}
`
}

function renderPythonHandler(functionName: string): string {
  return `def handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello from ${functionName}!",
    }
`
}

function renderGoMain(functionName: string): string {
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

export function generateLambdaAssetFiles(
  lambdaFunctions: DiagramLambdaFunction[],
): ProjectFile[] {
  const files: ProjectFile[] = []

  lambdaFunctions.forEach((lambdaFunction, index) => {
    const fallback = `LambdaFunction${index + 1}`
    const assetPath = getLambdaFunctionLibRelativePath(lambdaFunction.functionName, fallback)
    const displayName = lambdaFunction.functionName.trim() || fallback

    if (isNodejsLambdaRuntime(lambdaFunction.runtime)) {
      files.push({
        relativePath: `${assetPath}/index.ts`,
        content: renderTypeScriptHandler(displayName),
      })
      return
    }

    if (lambdaFunction.language === "python") {
      files.push({
        relativePath: `${assetPath}/index.py`,
        content: renderPythonHandler(displayName),
      })
      return
    }

    if (lambdaFunction.language === "go") {
      files.push(
        {
          relativePath: `${assetPath}/main.go`,
          content: renderGoMain(displayName),
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
