import { generateCdkProject } from "./cdk/generateCdkProject"
import { generateTerraformProject } from "./terraform/generateTerraformProject"
import type { GenerateProjectInput, ProjectFile } from "./types"

export function generateProjectFiles(input: GenerateProjectInput): ProjectFile[] {
  const { generatorType, stackName, resources } = input

  if (generatorType === "terraform") {
    return generateTerraformProject(stackName, resources)
  }

  return generateCdkProject(stackName, resources)
}
