import React, { useCallback } from 'react'
import { Button, GU, Info } from '@1hive/1hive-ui'
import { useWallet } from '../../../providers/Wallet'
import { useAgreementContract } from '../../../hooks/useCourtContracts'

function DisputeExecuteRuling({ disputeId, onExecuteRuling, subject }) {
  const wallet = useWallet()
  const arbitrableContract = useAgreementContract(subject)

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()

      onExecuteRuling(arbitrableContract, disputeId)
    },
    [arbitrableContract, disputeId, onExecuteRuling]
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
          Execute ruling
        </Button>
      </div>
      <Info>
        <strong>Anyone</strong> can now trigger this action.
      </Info>
    </form>
  )
}

export default DisputeExecuteRuling
