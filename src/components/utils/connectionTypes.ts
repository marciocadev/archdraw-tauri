export type ConnectionPathType = "bezier" | "smoothstep" | "step" | "straight"

export const CONNECTION_PATH_OPTIONS: { value: ConnectionPathType; label: string }[] = [
  { value: "bezier", label: "Bezier" },
  { value: "smoothstep", label: "Smooth Step" },
  { value: "step", label: "Step" },
  { value: "straight", label: "Straight" },
]

export const DEFAULT_CONNECTION_PATH_TYPE: ConnectionPathType = "bezier"

import type { MessageBodyFilter } from "./messageBodyFilterTypes"

export interface ConnectionDraft {
  label: string;
  pathType: ConnectionPathType;
  maxReceiveCount?: number;
  rawMessageDelivery?: boolean;
  messageBodyFilters?: MessageBodyFilter[];
}
