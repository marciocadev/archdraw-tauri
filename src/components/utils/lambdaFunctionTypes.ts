export interface LambdaFunctionConfig {
  functionName: string
}

export function getLambdaFunctionConfig(data: {
  functionName?: string
}): LambdaFunctionConfig {
  return {
    functionName: data.functionName ?? "",
  }
}
