export type CdkDurationUnit = "seconds" | "minutes" | "hours" | "days"

export function renderCdkDurationExpression(value: number, unit: CdkDurationUnit): string {
  return `cdk.Duration.${unit}(${value})`
}

export function renderCdkDurationOption(
  propertyName: string,
  value: number,
  unit: CdkDurationUnit,
): string {
  return `\n      ${propertyName}: ${renderCdkDurationExpression(value, unit)},`
}
