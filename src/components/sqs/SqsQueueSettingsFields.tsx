import {
  DELIVERY_DELAY_UNIT_LABELS,
  DELIVERY_DELAY_UNITS,
  MESSAGE_RETENTION_UNIT_LABELS,
  MESSAGE_RETENTION_UNITS,
  MAXIMUM_MESSAGE_SIZE_MAX_KIB,
  MAXIMUM_MESSAGE_SIZE_MIN_KIB,
  RECEIVE_MESSAGE_WAIT_TIME_MAX_SECONDS,
  RECEIVE_MESSAGE_WAIT_TIME_MIN_SECONDS,
  VISIBILITY_TIMEOUT_UNIT_LABELS,
  VISIBILITY_TIMEOUT_UNITS,
  type SqsQueueSettings,
  type SqsQueueSettingsErrors,
  type VisibilityTimeoutLimits,
} from "../utils/sqsQueueTypes"
import type { ChangeEventHandler } from "react"

export interface SqsQueueSettingsFieldsProps {
  idPrefix: string
  config: SqsQueueSettings
  errors: SqsQueueSettingsErrors
  visibilityLimits: VisibilityTimeoutLimits
  deliveryDelayLimits: VisibilityTimeoutLimits
  messageRetentionLimits: VisibilityTimeoutLimits
  onVisibilityTimeoutValueChange: ChangeEventHandler<HTMLInputElement>
  onVisibilityTimeoutUnitChange: ChangeEventHandler<HTMLSelectElement>
  onDeliveryDelayValueChange: ChangeEventHandler<HTMLInputElement>
  onDeliveryDelayUnitChange: ChangeEventHandler<HTMLSelectElement>
  onReceiveMessageWaitTimeChange: ChangeEventHandler<HTMLInputElement>
  onMessageRetentionValueChange: ChangeEventHandler<HTMLInputElement>
  onMessageRetentionUnitChange: ChangeEventHandler<HTMLSelectElement>
  onMaximumMessageSizeChange: ChangeEventHandler<HTMLInputElement>
}

export const SqsQueueSettingsFields = (props: SqsQueueSettingsFieldsProps) => {
  const {
    idPrefix,
    config,
    errors,
    visibilityLimits,
    deliveryDelayLimits,
    messageRetentionLimits,
    onVisibilityTimeoutValueChange,
    onVisibilityTimeoutUnitChange,
    onDeliveryDelayValueChange,
    onDeliveryDelayUnitChange,
    onReceiveMessageWaitTimeChange,
    onMessageRetentionValueChange,
    onMessageRetentionUnitChange,
    onMaximumMessageSizeChange,
  } = props

  return (
    <>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${idPrefix}-visibility-timeout-value`}
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Visibility Timeout
        </label>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-visibility-timeout-value`}
            type="number"
            min={visibilityLimits.min}
            max={visibilityLimits.max}
            step={1}
            value={config.visibilityTimeoutValue}
            onChange={onVisibilityTimeoutValueChange}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            id={`${idPrefix}-visibility-timeout-unit`}
            value={config.visibilityTimeoutUnit}
            onChange={onVisibilityTimeoutUnitChange}
            className="form-select w-32 shrink-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
            {VISIBILITY_TIMEOUT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {VISIBILITY_TIMEOUT_UNIT_LABELS[unit]}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          From 0 seconds to 12 hours. Default is 30 seconds.
        </p>
        {errors.visibilityTimeout && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.visibilityTimeout}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${idPrefix}-delivery-delay-value`}
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Delivery Delay
        </label>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-delivery-delay-value`}
            type="number"
            min={deliveryDelayLimits.min}
            max={deliveryDelayLimits.max}
            step={1}
            value={config.deliveryDelayValue}
            onChange={onDeliveryDelayValueChange}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            id={`${idPrefix}-delivery-delay-unit`}
            value={config.deliveryDelayUnit}
            onChange={onDeliveryDelayUnitChange}
            className="form-select w-32 shrink-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
            {DELIVERY_DELAY_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {DELIVERY_DELAY_UNIT_LABELS[unit]}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          From 0 seconds to 15 minutes. Default is 0 seconds.
        </p>
        {errors.deliveryDelay && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.deliveryDelay}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${idPrefix}-receive-message-wait-time`}
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Receive Message Wait Time
        </label>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-receive-message-wait-time`}
            type="number"
            min={RECEIVE_MESSAGE_WAIT_TIME_MIN_SECONDS}
            max={RECEIVE_MESSAGE_WAIT_TIME_MAX_SECONDS}
            step={1}
            value={config.receiveMessageWaitTime}
            onChange={onReceiveMessageWaitTimeChange}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
          <span className="flex w-32 shrink-0 items-center rounded-lg border border-slate-300 bg-slate-100 px-2 text-sm text-slate-600 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-300">
            Seconds
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          From 0 to 20 seconds. Default is 0 seconds.
        </p>
        {errors.receiveMessageWaitTime && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.receiveMessageWaitTime}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${idPrefix}-message-retention-value`}
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Message Retention Period
        </label>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-message-retention-value`}
            type="number"
            min={messageRetentionLimits.min}
            max={messageRetentionLimits.max}
            step={1}
            value={config.messageRetentionValue}
            onChange={onMessageRetentionValueChange}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            id={`${idPrefix}-message-retention-unit`}
            value={config.messageRetentionUnit}
            onChange={onMessageRetentionUnitChange}
            className="form-select w-32 shrink-0 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
            {MESSAGE_RETENTION_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {MESSAGE_RETENTION_UNIT_LABELS[unit]}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          From 1 minute to 14 days. Default is 4 days.
        </p>
        {errors.messageRetention && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.messageRetention}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${idPrefix}-maximum-message-size`}
          className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Maximum Message Size
        </label>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-maximum-message-size`}
            type="number"
            min={MAXIMUM_MESSAGE_SIZE_MIN_KIB}
            max={MAXIMUM_MESSAGE_SIZE_MAX_KIB}
            step={1}
            value={config.maximumMessageSizeKib}
            onChange={onMaximumMessageSizeChange}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
          <span className="flex w-32 shrink-0 items-center rounded-lg border border-slate-300 bg-slate-100 px-2 text-sm text-slate-600 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-300">
            KiB
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          From 1 KiB to 1024 KiB. Default is 1024 KiB.
        </p>
        {errors.maximumMessageSize && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.maximumMessageSize}</p>
        )}
      </div>
    </>
  )
}
