import React, { useCallback } from 'react'
import HNYForm from './HNYForm'
import { formatUnits } from '../../../lib/math-utils'
import { useCourtConfig } from '../../../providers/CourtConfig'

const WithdrawHNY = React.memo(function WithdrawHNY({
  onWithdrawHNY,
  inactiveBalance,
  onDone,
}) {
  const { anjToken } = useCourtConfig()

  const maxAmount = inactiveBalance
  const maxAmountFormatted = formatUnits(maxAmount, {
    digits: anjToken.decimals,
    precision: anjToken.decimals,
  })

  const validation = useCallback(
    amountBN => {
      if (amountBN.gt(maxAmount)) {
        return `Insufficient funds, you cannnot withdraw more than ${maxAmountFormatted} ${anjToken.symbol}`
      }

      return null
    },
    [anjToken.symbol, maxAmount, maxAmountFormatted]
  )

  return (
    <HNYForm
      actionLabel="Withdraw"
      maxAmount={maxAmount}
      onSubmit={onWithdrawHNY}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default WithdrawHNY
