import React from 'react'
import { GU, textStyle } from '@1hive/1hive-ui'
import { useCourtConfig } from '../../providers/CourtConfig'

import { numberToWord } from '../../lib/math-utils'

function DisputeRoundPill({ roundId }) {
  const { maxRegularAppealRounds } = useCourtConfig()

  if (roundId === undefined) return null

  const isFinal = roundId >= maxRegularAppealRounds

  const label = isFinal ? 'Final round' : `Round ${numberToWord(roundId)}`
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: linear-gradient(120deg, #fff0d9 -18%, #ffdfd1 143%);
        border-radius: 100px;
        height: ${2.5 * GU}px;
        width: ${14 * GU}px;
        margin-top: ${0.5 * GU}px;
      `}
    >
      <span
        css={`
          ${textStyle('label2')};
          color: #ff9165;
          transform: translateY(1px);
        `}
      >
        {label}
      </span>
    </div>
  )
}

export default DisputeRoundPill
