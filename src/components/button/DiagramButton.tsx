import { useRef, type DragEvent, type ReactNode } from "react";

export interface DiagramButtonProps {
  diagramKey: string;
  type: string;
  component: string;
  children: ReactNode;
  onDragStart?: (event: DragEvent<HTMLButtonElement>, diagramKey: string) => void
  onClick?: () => void
}

export const DiagramButton = (props: DiagramButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { type, component, children, diagramKey, onClick, onDragStart } = props;

  return (
    <button
      type="button"
      draggable
      ref={buttonRef}
      onClick={onClick}
      onDragStart={(event) => onDragStart?.(event, diagramKey)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border p-2 text-left
        bg-slate-50 text-slate-700
        dark:border-slate-500 dark:bg-mist-900 dark:text-slate-200
        border-slate-300"
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="w-full truncate text-sm font-medium">
          {type}
        </span>
        <span className="w-full truncate text-xs text-slate-500 dark:text-slate-400">
          {component}
        </span>
      </div>
      <div className="flex shrink-0 items-center justify-center">
        {children}
      </div>
    </button>
  )
}
