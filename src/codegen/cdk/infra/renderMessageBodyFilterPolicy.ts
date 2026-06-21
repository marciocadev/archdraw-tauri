import type { MessageBodyFilter } from "../../../components/utils/messageBodyFilterTypes"

interface MergedFieldFilter {
  allowlist: string[]
  denylist: string[]
  matchPrefixes: string[]
  matchSuffixes: string[]
}

function escapeTsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
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

function renderStringArray(values: string[]): string {
  return values.map((value) => `'${escapeTsString(value)}'`).join(", ")
}

function renderMergedFieldFilter(filter: MergedFieldFilter): string {
  const options: string[] = []

  if (filter.allowlist.length > 0) {
    options.push(`allowlist: [${renderStringArray(filter.allowlist)}]`)
  }

  if (filter.denylist.length > 0) {
    options.push(`denylist: [${renderStringArray(filter.denylist)}]`)
  }

  if (filter.matchPrefixes.length > 0) {
    options.push(`matchPrefixes: [${renderStringArray(filter.matchPrefixes)}]`)
  }

  if (filter.matchSuffixes.length > 0) {
    options.push(`matchSuffixes: [${renderStringArray(filter.matchSuffixes)}]`)
  }

  return `sns.SubscriptionFilter.stringFilter({ ${options.join(", ")} })`
}

export function renderMessageBodyFilterPolicy(filters: MessageBodyFilter[]): string {
  if (filters.length === 0) {
    return ""
  }

  const groupedFilters = groupMessageBodyFilters(filters)
  const entries = [...groupedFilters.entries()]
    .map(([field, filter]) =>
      `'${escapeTsString(field)}': sns.FilterOrPolicy.filter(${renderMergedFieldFilter(filter)}),`,
    )
    .join("\n        ")

  return `\n      filterPolicyWithMessageBody: {\n        ${entries}\n      },`
}
