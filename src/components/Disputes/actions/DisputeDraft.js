import React, { useCallback } from 'react'
import { Button, GU, Info } from '@1hive/1hive-ui'
import { useWallet } from '../../../providers/Wallet'

function DisputeDraft({ disputeId, onDraft }) {
  const wallet = useWallet()

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()

      onDraft(disputeId)
    },
    [disputeId, onDraft]
  )

  return (
    <form onSubmit={handleSubmit}>
      <div
        css={`
          display: flex;
          width: 100%;
          margin-bottom: ${1.5 * GU}px;
        `}
      >
        <Button type="submit" mode="strong" wide disabled={!wallet.account}>
          Draft jury
        </Button>
      </div>
      <Info>
        The comments submission period is closed. <strong>Anyone</strong> can
        now trigger the drafting of a jury and earn some rewards.
      </Info>
    </form>
  )
}

export default DisputeDraft
