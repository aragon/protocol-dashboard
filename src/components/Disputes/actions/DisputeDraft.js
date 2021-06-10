import React, { useCallback } from 'react'
import { Button, GU, Info } from '@aragon/ui'
import { useWallet } from '../../../providers/Wallet'
import { useCourtClock } from '../../../providers/CourtClock'

function DisputeDraft({ disputeId, onDraft }) {
  const wallet = useWallet()
  const { neededTransitions } = useCourtClock()

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      if(neededTransitions === 0) {
        onDraft(disputeId)  
      }
    },
    [disputeId, onDraft, neededTransitions]
  )

  const disabled = !wallet.account || neededTransitions !== 0

  return (
    <form onSubmit={handleSubmit}>
      <div
        css={`
          display: flex;
          width: 100%;
          margin-bottom: ${1.5 * GU}px;
        `}
      >
        <Button type="submit" mode="strong" wide disabled={disabled}>
          Summon guardians
        </Button>
      </div>
      {
        disabled && 
          <Info mode="warning">
            In order to be able to summon guardians, please connect your wallet and make sure that term is up to date.
            Keep in mind that it's worth waiting 2 minutes before summoning the guardians if the term was recently updated
          </Info>
      }
      <Info>
        The evidence submission period is closed. <strong>Anyone</strong> can
        now trigger the summon of a guardian and earn some rewards.
      </Info>
    </form>
  )
}

export default DisputeDraft
