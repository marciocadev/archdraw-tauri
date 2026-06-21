export function getLambdaFunctionFolderName(functionName: string, fallback: string): string {
  const name = functionName.trim() || fallback
  const sanitized = name
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")

  return sanitized || fallback
}

export function getLambdaFunctionLibRelativePath(functionName: string, fallback: string): string {
  return `lib/functions/${getLambdaFunctionFolderName(functionName, fallback)}`
}

export function getLambdaFunctionTerraformRelativePath(functionName: string, fallback: string): string {
  return `functions/${getLambdaFunctionFolderName(functionName, fallback)}`
}

/** @deprecated Use getLambdaFunctionLibRelativePath */
export function getLambdaAssetPath(functionName: string, fallback: string): string {
  return getLambdaFunctionLibRelativePath(functionName, fallback)
}
