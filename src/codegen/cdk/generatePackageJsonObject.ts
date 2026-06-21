import { isNodejsLambdaRuntime } from "./infra/renderLambdaFunctionOptions"
import type { DiagramResources } from "../types"

export const generatePackageJsonObject = (stackName: string, resources: DiagramResources) => {
  const hasNodejsLambdaFunctions = resources.lambdaFunctions.some((lambdaFunction) =>
    isNodejsLambdaRuntime(lambdaFunction.runtime),
  )
  const hasGoLambdaFunctions = resources.lambdaFunctions.some((lambdaFunction) =>
    lambdaFunction.language === "go",
  )

  const devDependencies: Record<string, string> = {
    "@types/jest": "^30",
    "@types/node": "^24.10.1",
    "jest": "^30",
    "ts-jest": "^29",
    "aws-cdk": "2.1126.0",
    "ts-node": "^10.9.2",
    "typescript": "~5.9.3",
  }

  if (hasNodejsLambdaFunctions) {
    devDependencies["@types/aws-lambda"] = "^8.10.150"
  }

  const scripts: Record<string, string> = {
    build: "tsc",
    watch: "tsc -w",
    test: "jest",
    cdk: "cdk",
  }

  if (hasGoLambdaFunctions) {
    scripts["build:lambda:go"] = "find lib/functions -name Makefile -execdir make build \\;"
  }

  return {
    name: stackName,
    version: "0.1.0",
    scripts,
    devDependencies,
    dependencies: {
      "aws-cdk-lib": "^2.257.0",
      constructs: "^10.5.0",
      esbuild: "^0.28.1",
    },
  }
}
