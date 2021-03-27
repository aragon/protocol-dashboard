import React from 'react'
import { GU, textStyle, Timer, useTheme } from '@1hive/1hive-ui'

import DisputeOutcomeText from './DisputeOutcomeText'
import { convertToString } from '../../types/dispute-status-types'

function DisputePhase({ finalRuling, nextTransition, phase }) {
  const stringPhase = convertToString(phase)
  const theme = useTheme()

  const darkMode = theme._appearance === 'dark'

  return (
    <div
      css={`
        flex-direction: column;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          margin-bottom: ${3 * GU}px;
        `}
      >
        <div
          css={`
            position: relative;
            width: 16px;
            height: 16px;
          `}
        >
          <div
            css={`
              width: 100%;
              height: 100%;
              border-radius: 50%;
              opacity: ${darkMode ? '0.2' : '1'};
              background: ${darkMode
                ? 'linear-gradient(51deg, #E8E1FF -0.5%, #B19AFF 88%)'
                : '#fef3f1'};
            `}
          />
          <div
            css={`
              position: absolute;
              top: 5px;
              left: 5px;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${darkMode
                ? 'linear-gradient(234deg, #B19AFF 17%, #D1C4FF 75%)'
                : 'linear-gradient(234deg, #FF9B73 16%, #FFBE95 75%)'};
            `}
          />
        </div>
        <span
          css={`
            margin-left: ${1 * GU}px;
            color: ${theme.tagIndicatorContent};
            ${textStyle('body2')};
            weight: 300;
          `}
        >
          {stringPhase}
        </span>
      </div>

      {finalRuling ? (
        <DisputeOutcomeText outcome={finalRuling} isFinalRuling />
      ) : (
        <DisplayTime phase={phase} nextTransition={nextTransition} />
      )}
    </div>
  )
}

function DisplayTime({ nextTransition }) {
  const theme = useTheme()

  if (!nextTransition) {
    return (
      <div>
        <span
          css={`
            color: ${theme.surfaceContentSecondary};
            opacity: 0.6;
          `}
        >
          ANY TIME
        </span>
      </div>
    )
  }
  return (
    <div
      css={`
        margin-left: -${0.5 * GU}px;
        margin-bottom: ${2 * GU}px;
      `}
    >
      <Timer end={new Date(nextTransition)} />
    </div>
  )
}

export default DisputePhase
