export interface SqsDlqConfig {
  dlqName: string
}

export function getSqsDlqConfig(data: {
  dlqName?: string
}): SqsDlqConfig {
  return {
    dlqName: data.dlqName ?? "",
  }
}
