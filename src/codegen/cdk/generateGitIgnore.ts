import type { DiagramResources } from "../types"

export const GenerateGitIgnore = (resources: DiagramResources) => {
  const goBuildArtifacts = resources.lambdaFunctions.some((lambdaFunction) =>
    lambdaFunction.language === "go",
  )
    ? `
# Go Lambda build artifacts
lib/functions/**/cmd/bootstrap
`
    : ""

  return `*.js
!jest.config.js
*.d.ts
node_modules
${goBuildArtifacts}
# CDK asset staging directory
.cdk.staging
cdk.out
`
}
