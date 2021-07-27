import React, { useMemo, useContext } from 'react'
import { textStyle, useTheme, IconClose, IconCheck } from '@aragon/ui'

import { Phase as DisputePhase } from '../../types/dispute-status-types'
import {
  appealRulingToString,
  finalRulingToString,
  juryOutcomeToString,
  OUTCOMES,
} from '../../utils/crvoting-utils'

import { DisputeContext } from './DisputeDetail';

function DisputeOutcomeText({
  action,
  isFinalRuling,
  outcome,
  phase,
  verbose = false,
  voteButtons = null
}) {
  const disputeContext = useContext(DisputeContext);

  const { Icon, color } = useOutcomeStyle(outcome, disputeContext?.voteButtons)
  
  const outcomeText = useMemo(() => {
    if (isFinalRuling) {
      return finalRulingToString(outcome, disputeContext?.voteButtons || voteButtons)
    }

    if (
      phase === DisputePhase.AppealRuling ||
      phase === DisputePhase.ConfirmAppeal
    ) {
      const confirm = phase === DisputePhase.ConfirmAppeal
      return appealRulingToString(outcome, confirm, disputeContext?.voteButtons || voteButtons)
    }

    return juryOutcomeToString(outcome, disputeContext?.voteButtons || voteButtons)
  }, [isFinalRuling, outcome, phase, voteButtons, disputeContext])
  
  return (
    <div>
      <div
        css={`
          color: ${color};
          display: flex;
          align-items: center;
        `}
      >
        <Icon size="medium" />
        <span
          css={`
            ${textStyle('body2')}
          `}
        >
          {outcomeText}
          {verbose && <span>: {action}</span>}
        </span>
      </div>
    </div>
  )
}

function useOutcomeStyle(outcome, voteButtons) {
  const theme = useTheme()

  // if dispute contains their own button texts instead of
  // allow action and block action, we always show positive mark checks.
  if(voteButtons?.inFavorText && voteButtons?.againstText) {
    return {
      Icon: IconCheck,
      color: theme.positive,
    }
  }

  if (!outcome || outcome === OUTCOMES.Refused) {
    return {
      Icon: IconClose,
      color: theme.disabledIcon,
    }
  }

  if (outcome === OUTCOMES.Against) {
    return {
      Icon: IconClose,
      color: theme.negative,
    }
  }

  if (outcome === OUTCOMES.InFavor) {
    return {
      Icon: IconCheck,
      color: theme.positive,
    }
  }
}

export default DisputeOutcomeText
