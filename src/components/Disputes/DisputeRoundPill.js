import React from 'react'
import { GU, textStyle, useTheme } from '@1hive/1hive-ui'
import { useCourtConfig } from '../../providers/CourtConfig'

import { numberToWord } from '../../lib/math-utils'

function DisputeRoundPill({ roundId }) {
  const theme = useTheme()
  const { maxRegularAppealRounds } = useCourtConfig()

  if (roundId === undefined) return null

  const darkMode = theme._appearance === 'dark'
  const isFinal = roundId >= maxRegularAppealRounds
  const label = isFinal ? 'Final round' : `Round ${numberToWord(roundId)}`

  return (
    <div
      css={`
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: ${darkMode
          ? 'rgba(77, 34, 223, 0.2)'
          : 'linear-gradient(120deg, #fff0d9 -18%, #ffdfd1 143%)'};
        border-radius: 100px;
        height: ${2.5 * GU}px;
        width: ${14 * GU}px;
        margin-top: ${0.5 * GU}px;
      `}
    >
      <span
        css={`
          ${textStyle('label2')};
          color: ${darkMode ? '#B19AFF' : '#ff9165'};
          transform: translateY(1px);
        `}
      >
        {label}
      </span>
    </div>
  )
}

export default DisputeRoundPill
