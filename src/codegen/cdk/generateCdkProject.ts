import { toPascalCase } from "../sanitizeNames"
import type { DiagramResources, ProjectFile } from "../types"
import { generateAppObject } from "./generateAppObject"
import { generateCdkJsonObject } from "./generateCdkJsonObject"
import { GenerateGitIgnore } from "./generateGitIgnore"
import { generateJestConfigObject } from "./generateJestConfigObject"
import { generateLambdaAssetFiles } from "./lambda/generateLambdaAssetFiles"
import { generatePackageJsonObject } from "./generatePackageJsonObject"
import { generateReadMeObject } from "./generateReadMeObject"
import { generateStackObject } from "./generateStackObject"
import { generateTsConfigObject } from "./generateTsConfigObject"

export function generateCdkProject(stackName: string, resources: DiagramResources): ProjectFile[] {
  const stackClassName = toPascalCase(stackName, "ArchDrawStack")
  const stackFileName = stackName
  const lambdaAssetFiles = generateLambdaAssetFiles(resources)

  return [
    {
      relativePath: "README.md",
      content: generateReadMeObject(stackName, resources),
    },
    {
      relativePath: "jest.config.js",
      content: generateJestConfigObject(),
    },
    {
      relativePath: ".gitignore",
      content: GenerateGitIgnore(resources),
    },
    {
      relativePath: "package.json",
      content: JSON.stringify(generatePackageJsonObject(stackFileName, resources), null, 2),
    },
    {
      relativePath: "cdk.json",
      content: JSON.stringify(generateCdkJsonObject(stackFileName), null, 2),
    },
    {
      relativePath: "tsconfig.json",
      content: JSON.stringify(generateTsConfigObject(), null, 2),
    },
    {
      relativePath: `bin/${stackFileName}.ts`,
      content: generateAppObject(stackFileName, stackClassName),
    },
    {
      relativePath: `lib/${stackFileName}-stack.ts`,
      content: generateStackObject(stackClassName, resources),
    },
    ...lambdaAssetFiles,
  ]
}
