export const DEFAULT_RAW_MESSAGE_DELIVERY = false

export function getRawMessageDelivery(rawMessageDelivery?: boolean): boolean {
  return rawMessageDelivery ?? DEFAULT_RAW_MESSAGE_DELIVERY
}

export function formatRawMessageDeliveryBadge(rawMessageDelivery?: boolean): string {
  return getRawMessageDelivery(rawMessageDelivery)
    ? "[raw message delivery on]"
    : "[raw message delivery off]"
}
