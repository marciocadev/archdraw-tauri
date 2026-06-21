import type { MessageBodyFilter } from "../../../components/utils/messageBodyFilterTypes"
import { escapeTerraformString } from "./escapeTerraformString"

interface MergedFieldFilter {
  allowlist: string[]
  denylist: string[]
  matchPrefixes: string[]
  matchSuffixes: string[]
}

function groupMessageBodyFilters(filters: MessageBodyFilter[]): Map<string, MergedFieldFilter> {
  const grouped = new Map<string, MergedFieldFilter>()

  for (const filter of filters) {
    const current = grouped.get(filter.field) ?? {
      allowlist: [],
      denylist: [],
      matchPrefixes: [],
      matchSuffixes: [],
    }

    switch (filter.filterType) {
      case "allow":
        current.allowlist.push(...filter.values)
        break
      case "deny":
        current.denylist.push(...filter.values)
        break
      case "prefix":
        current.matchPrefixes.push(...filter.values)
        break
      case "suffix":
        current.matchSuffixes.push(...filter.values)
        break
    }

    grouped.set(filter.field, current)
  }

  return grouped
}

function renderTerraformStringArray(values: string[]): string {
  return `[${values.map((value) => `"${escapeTerraformString(value)}"`).join(", ")}]`
}

function renderMergedFieldFilter(filter: MergedFieldFilter): string {
  const conditions: string[] = [...filter.allowlist.map((value) => `"${escapeTerraformString(value)}"`)]

  for (const value of filter.denylist) {
    conditions.push(`{
      anything-but = ${renderTerraformStringArray([value])}
    }`)
  }

  for (const value of filter.matchPrefixes) {
    conditions.push(`{
      prefix = "${escapeTerraformString(value)}"
    }`)
  }

  for (const value of filter.matchSuffixes) {
    conditions.push(`{
      suffix = "${escapeTerraformString(value)}"
    }`)
  }

  return conditions.length === 1 ? conditions[0] : `[${conditions.join(", ")}]`
}

export function renderTerraformMessageBodyFilterPolicy(filters: MessageBodyFilter[]): string {
  if (filters.length === 0) {
    return ""
  }

  const groupedFilters = groupMessageBodyFilters(filters)
  const entries = [...groupedFilters.entries()]
    .map(([field, filter]) => `    "${escapeTerraformString(field)}" = ${renderMergedFieldFilter(filter)}`)
    .join("\n")

  return `\n  filter_policy_scope = "MessageBody"
  filter_policy = jsonencode({
${entries}
  })`
}
