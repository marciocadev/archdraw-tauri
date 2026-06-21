export const DEFAULT_MAX_RECEIVE_COUNT = 10
export const MAX_RECEIVE_COUNT_MIN = 1
export const MAX_RECEIVE_COUNT_MAX = 1000

export function clampMaxReceiveCount(value: number): number {
  return Math.min(Math.max(value, MAX_RECEIVE_COUNT_MIN), MAX_RECEIVE_COUNT_MAX)
}

export function getMaxReceiveCount(maxReceiveCount?: number): number {
  if (maxReceiveCount === undefined) {
    return DEFAULT_MAX_RECEIVE_COUNT
  }

  return clampMaxReceiveCount(maxReceiveCount)
}

export function validateMaxReceiveCount(value: number): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Enter a valid whole number for maximum receives."
  }

  if (value < MAX_RECEIVE_COUNT_MIN || value > MAX_RECEIVE_COUNT_MAX) {
    return `Maximum receives must be between ${MAX_RECEIVE_COUNT_MIN} and ${MAX_RECEIVE_COUNT_MAX}.`
  }

  return null
}
