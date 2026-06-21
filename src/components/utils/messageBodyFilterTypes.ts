export type MessageBodyFilterType = "allow" | "deny" | "prefix" | "suffix"

export interface MessageBodyFilter {
  field: string;
  filterType: MessageBodyFilterType;
  values: string[];
}

export const MESSAGE_BODY_FILTER_TYPE_OPTIONS: {
  value: MessageBodyFilterType;
  label: string;
}[] = [
  { value: "allow", label: "Allow" },
  { value: "deny", label: "Deny" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
]

export const DEFAULT_MESSAGE_BODY_FILTER_TYPE: MessageBodyFilterType = "allow"

export function parseCommaSeparatedValues(input: string): string[] {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
}

export function getMessageBodyFilters(filters?: MessageBodyFilter[]): MessageBodyFilter[] {
  return filters ?? []
}

export function validateMessageBodyFilterDraft(field: string, allowValues: string): string | null {
  if (!field.trim()) {
    return "Field is required."
  }

  if (parseCommaSeparatedValues(allowValues).length === 0) {
    return "Enter at least one value separated by commas."
  }

  return null
}

export function createMessageBodyFilter(
  field: string,
  filterType: MessageBodyFilterType,
  allowValues: string,
): MessageBodyFilter {
  return {
    field: field.trim(),
    filterType,
    values: parseCommaSeparatedValues(allowValues),
  }
}

export function getMessageBodyFilterTypeLabel(filterType: MessageBodyFilterType): string {
  return MESSAGE_BODY_FILTER_TYPE_OPTIONS.find((option) => option.value === filterType)?.label ?? filterType
}
