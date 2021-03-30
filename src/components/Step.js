import React from 'react'
import { GU, useTheme } from '@1hive/1hive-ui'

export default function Step({
  stepPoint,
  content,
  active,
  displayPoint,
  ...props
}) {
  const theme = useTheme()

  if (displayPoint) {
    return (
      <div
        css={`
          background: ${active
            ? theme._appearance === 'light'
              ? 'linear-gradient(235deg, #FFFCF7 -3%, #FFF6E9 216%)'
              : 'rgba(77, 75, 144, 0.2)'
            : ''};
        `}
      >
        <div
          css={`
            display: flex;
            margin-left: ${3 * GU}px;
            margin-top: ${active ? 3 * GU : 0}px;
          `}
          {...props}
        >
          <div
            css={`
              position: relative;
              z-index: 1;
            `}
          >
            {stepPoint}
          </div>

          <div
            css={`
              margin-left: ${1.5 * GU}px;
            `}
          >
            {content}
          </div>
        </div>
      </div>
    )
  } else {
    return <div>{content}</div>
  }
}
