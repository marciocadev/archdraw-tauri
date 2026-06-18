import type { MouseEvent } from "react"

export interface MenuNodeProps {
  haveTarget: boolean
  handleTargetToggle: (event: MouseEvent<HTMLButtonElement>) => void
  isTargetAnimating: boolean
  targetProgress: number
  haveSource: boolean
  handleSourceToggle: (event: MouseEvent<HTMLButtonElement>) => void
  isSourceAnimating: boolean
  sourceProgress: number
  handleGroupToggle: (event: MouseEvent<HTMLButtonElement>) => void
  isGrouped: boolean
  handleDelete: (event: MouseEvent<HTMLButtonElement>) => void
}

export const MenuNode = (props: MenuNodeProps) => {
  const {
    haveTarget,
    haveSource,
    isTargetAnimating,
    targetProgress,
    handleTargetToggle,
    handleGroupToggle,
    handleDelete,
    handleSourceToggle,
    isSourceAnimating,
    sourceProgress,
    isGrouped } = props

  return (
    <div className="nodrag nopan absolute right-0 bottom-full z-10 mb-2">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        {haveTarget && (
          <>
            <button
              type="button"
              disabled={isTargetAnimating}
              className="nodrag nopan flex items-center justify-center px-3 py-2 text-sm font-medium rounded-l-full
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2
          focus:ring-blue-700 focus:text-blue-700
          border-slate-900 disabled:opacity-60 border-l border-t border-b
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900"
              onClick={handleTargetToggle}
              aria-label={targetProgress >= 0.5 ? "Mover entrada para esquerda" : "Mover entrada para cima"}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-none"
                style={{ transform: `rotate(${90 * targetProgress}deg)` }}>
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <span className="w-0.5 justify-start items-center flex bg-slate-500" />
          </>
        )}
        <button type="button" className={`px-4 py-2 text-sm font-medium ${haveTarget ? "" : "rounded-l-full"}
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2>
          focus:ring-blue-700 focus:text-blue-700>
          border-slate-900 disabled:opacity-60 border-l border-t border-b>
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
        <span className="w-0.5 justify-start items-center flex bg-slate-500" />
        <button type="button" className="nodrag nopan px-4 py-2 text-sm font-medium
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2>
          focus:ring-blue-700 focus:text-blue-700>
          border-slate-900 disabled:opacity-60 border-l border-t border-b>
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900"
          onClick={handleGroupToggle}>
          {isGrouped ?
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" />
              <rect x="6" y="6" width="6" height="6" fill="currentColor" />
              <rect x="12" y="12" width="6" height="6" fill="currentColor" />
            </svg> :
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4">
              <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" fill="none" strokeDasharray="3 2" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" fill="none" strokeDasharray="3 2" />
            </svg>}
        </button>
        <span className="w-0.5 justify-start items-center flex bg-slate-500" />
        <button type="button" className={`nodrag nopan px-4 py-2 text-sm font-medium ${haveSource ? "" : "rounded-r-full"}
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2>
          focus:ring-blue-700 focus:text-blue-700>
          border-slate-900 disabled:opacity-60 border-l border-t border-b>
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900`}
          onClick={handleDelete}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
        {haveSource && (
          <>
            <span className="w-0.5 justify-start items-center flex bg-slate-500" />
            <button
              type="button"
              disabled={isSourceAnimating}
              className="nodrag nopan flex items-center justify-center px-3 py-2 text-sm font-medium rounded-r-full
          hover:bg-gray-100 hover:dark:bg-slate-950 focus:z-10 focus:ring-2>
          focus:ring-blue-700 focus:text-blue-700>
          border-slate-900 disabled:opacity-60 border-l border-t border-b>
          dark:text-gray-200 text-gray-700 bg-white dark:bg-slate-900"
              onClick={handleSourceToggle}
              aria-label={sourceProgress >= 0.5 ? "Mover saída para direita" : "Mover saída para baixo"}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-none"
                style={{ transform: `rotate(${90 * sourceProgress}deg)` }}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>

  )
}