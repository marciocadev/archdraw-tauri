export type HideHorizontalLeftBarSvgProps = {
  horizontalLeftBar: boolean
};

export const HideHorizontalLeftBarSvg = (props: HideHorizontalLeftBarSvgProps) => {
  return (
    <>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 2H6.8V4H2Z" fill={props.horizontalLeftBar === true ? "currentcolor" : "!currentcolor"} />
        <path d="M2 3H6.88V12H2Z" fill={props.horizontalLeftBar === true ? "currentcolor" : "!currentcolor"} />
        <path d="M3 11H6.8V14H3Z" fill={props.horizontalLeftBar === true ? "currentcolor" : "!currentcolor"} />
        <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" rx="3" ry="3" />
        <line x1=" 6.8" y1="2" x2="6.8" y2="14" stroke="currentColor" strokeWidth="1" />
      </svg>
    </>
  )
}