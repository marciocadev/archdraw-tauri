export function escapeTerraformString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}
