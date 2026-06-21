import { useEffect, useState, type ChangeEvent } from "react"
import {
  CONNECTION_PATH_OPTIONS,
  type ConnectionDraft,
  type ConnectionPathType,
} from "./utils/connectionTypes"
import {
  DEFAULT_MAX_RECEIVE_COUNT,
  MAX_RECEIVE_COUNT_MAX,
  MAX_RECEIVE_COUNT_MIN,
  validateMaxReceiveCount,
} from "./utils/dlqConnectionTypes"
import {
  createMessageBodyFilter,
  DEFAULT_MESSAGE_BODY_FILTER_TYPE,
  getMessageBodyFilterTypeLabel,
  getMessageBodyFilters,
  MESSAGE_BODY_FILTER_TYPE_OPTIONS,
  validateMessageBodyFilterDraft,
  type MessageBodyFilterType,
} from "./utils/messageBodyFilterTypes"
import {
  DEFAULT_RAW_MESSAGE_DELIVERY,
} from "./utils/snsSqsConnectionTypes"

export interface ConnectionConfigPanelProps {
  isOpen: boolean;
  isDlqConnection: boolean;
  isSnsSqsConnection: boolean;
  initialDraft: ConnectionDraft;
  onConfirm: (draft: ConnectionDraft) => void;
  onCancel: () => void;
  onDisconnect: () => void;
}

export const ConnectionConfigPanel = (props: ConnectionConfigPanelProps) => {
  const {
    isOpen,
    isDlqConnection,
    isSnsSqsConnection,
    initialDraft,
    onConfirm,
    onCancel,
    onDisconnect,
  } = props
  const [isVisible, setIsVisible] = useState(false)
  const [draft, setDraft] = useState<ConnectionDraft>(initialDraft)
  const [maxReceiveCountError, setMaxReceiveCountError] = useState<string | null>(null)
  const [newFilterField, setNewFilterField] = useState("")
  const [newFilterType, setNewFilterType] = useState<MessageBodyFilterType>(DEFAULT_MESSAGE_BODY_FILTER_TYPE)
  const [newFilterValues, setNewFilterValues] = useState("")
  const [filterError, setFilterError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setDraft(initialDraft)
      setMaxReceiveCountError(null)
      setNewFilterField("")
      setNewFilterType(DEFAULT_MESSAGE_BODY_FILTER_TYPE)
      setNewFilterValues("")
      setFilterError(null)
      return
    }

    const timeoutId = window.setTimeout(() => setIsVisible(false), 300)
    return () => window.clearTimeout(timeoutId)
  }, [initialDraft, isOpen])

  if (!isOpen && !isVisible) {
    return null
  }

  const handleLabelChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft((current) => ({ ...current, label: event.target.value }))
  }

  const handlePathTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDraft((current) => ({
      ...current,
      pathType: event.target.value as ConnectionPathType,
    }))
  }

  const handleMaxReceiveCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    setDraft((current) => ({ ...current, maxReceiveCount: parsed }))
    setMaxReceiveCountError(null)
  }

  const handleRawMessageDeliveryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft((current) => ({ ...current, rawMessageDelivery: event.target.checked }))
  }

  const handleNewFilterFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewFilterField(event.target.value)
    setFilterError(null)
  }

  const handleNewFilterTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewFilterType(event.target.value as MessageBodyFilterType)
  }

  const handleNewFilterValuesChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewFilterValues(event.target.value)
    setFilterError(null)
  }

  const handleAddFilter = () => {
    const validationError = validateMessageBodyFilterDraft(newFilterField, newFilterValues)
    if (validationError) {
      setFilterError(validationError)
      return
    }

    const filter = createMessageBodyFilter(newFilterField, newFilterType, newFilterValues)
    setDraft((current) => ({
      ...current,
      messageBodyFilters: [...getMessageBodyFilters(current.messageBodyFilters), filter],
    }))
    setNewFilterField("")
    setNewFilterValues("")
    setFilterError(null)
  }

  const handleRemoveFilter = (index: number) => {
    setDraft((current) => ({
      ...current,
      messageBodyFilters: getMessageBodyFilters(current.messageBodyFilters).filter((_, filterIndex) => filterIndex !== index),
    }))
  }

  const handleConfirm = () => {
    if (isDlqConnection) {
      const validationError = validateMaxReceiveCount(draft.maxReceiveCount ?? DEFAULT_MAX_RECEIVE_COUNT)
      if (validationError) {
        setMaxReceiveCountError(validationError)
        return
      }
    }

    onConfirm(draft)
  }

  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "-translate-y-full"
        }`}>
      <div className="w-full border-b border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/95">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-[AmazonEmberBold] text-slate-700 dark:text-slate-200">
            Connection Settings
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {isSnsSqsConnection && (
            <>
              <label
                htmlFor="connection-raw-message-delivery"
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  id="connection-raw-message-delivery"
                  type="checkbox"
                  checked={draft.rawMessageDelivery ?? DEFAULT_RAW_MESSAGE_DELIVERY}
                  onChange={handleRawMessageDeliveryChange}
                  className="size-4 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800"
                />
                Enable raw message delivery
              </label>

              <div className="flex flex-col gap-3 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Message body filters
                </h3>

                {getMessageBodyFilters(draft.messageBodyFilters).length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {getMessageBodyFilters(draft.messageBodyFilters).map((filter, index) => (
                      <li
                        key={`${filter.field}-${filter.filterType}-${index}`}
                        className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <span>
                          <span className="font-medium">{filter.field}</span>
                          {" · "}
                          {getMessageBodyFilterTypeLabel(filter.filterType)}
                          {" · "}
                          {filter.values.join(", ")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(index)}
                          className="shrink-0 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="connection-filter-field"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Field
                    </label>
                    <input
                      id="connection-filter-field"
                      type="text"
                      value={newFilterField}
                      onChange={handleNewFilterFieldChange}
                      placeholder="e.g. payload.status"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="connection-filter-type"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Filter type
                    </label>
                    <select
                      id="connection-filter-type"
                      value={newFilterType}
                      onChange={handleNewFilterTypeChange}
                      className="form-select rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
                      {MESSAGE_BODY_FILTER_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="connection-filter-values"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Allow Values
                    </label>
                    <input
                      id="connection-filter-values"
                      type="text"
                      value={newFilterValues}
                      onChange={handleNewFilterValuesChange}
                      placeholder="value1, value2"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Separate multiple values with commas.
                </p>

                {filterError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{filterError}</p>
                )}

                <button
                  type="button"
                  onClick={handleAddFilter}
                  className="self-start rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500">
                  Add Filter
                </button>
              </div>
            </>
          )}

          {isDlqConnection && (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="connection-max-receive-count"
                className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Maximum Receives
              </label>
              <input
                id="connection-max-receive-count"
                type="number"
                min={MAX_RECEIVE_COUNT_MIN}
                max={MAX_RECEIVE_COUNT_MAX}
                step={1}
                value={draft.maxReceiveCount ?? DEFAULT_MAX_RECEIVE_COUNT}
                onChange={handleMaxReceiveCountChange}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                From 1 to 1000. Default is 10.
              </p>
              {maxReceiveCountError && (
                <p className="text-xs text-red-600 dark:text-red-400">{maxReceiveCountError}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="connection-path-type"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Line Type
            </label>
            <select
              id="connection-path-type"
              value={draft.pathType}
              onChange={handlePathTypeChange}
              className="form-select rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
              {CONNECTION_PATH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="connection-label"
              className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Connection Label
            </label>
            <textarea
              id="connection-label"
              value={draft.label}
              onChange={handleLabelChange}
              rows={3}
              placeholder="Enter the text displayed on the connection"
              className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            After saving, drag the label directly on the line to reposition it.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-lg px-4 py-2 text-sm bg-amber-600 text-white hover:bg-amber-500">
            Remove Connection
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-500">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg px-4 py-2 text-sm bg-sky-600 text-white hover:bg-sky-500">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
