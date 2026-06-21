export function toTerraformResourceName(value: string, fallback: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")

  if (!sanitized) {
    return fallback
  }

  if (/^\d/.test(sanitized)) {
    return `_${sanitized}`
  }

  return sanitized
}

export function toPascalCase(value: string, fallback: string): string {
  const parts = value
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return fallback
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("")
}

export function toCamelCase(value: string, fallback: string): string {
  const pascalCase = toPascalCase(value, "")

  if (!pascalCase) {
    return fallback
  }

  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1)
}

export function toStackDirectoryName(value: string): string {
  return value
    .trim()
    .replace(/[/\\:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isValidStackName(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  return !/[/\\:*?"<>|]/.test(trimmed)
}
