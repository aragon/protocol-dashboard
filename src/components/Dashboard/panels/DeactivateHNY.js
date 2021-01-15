import React, { useCallback } from 'react'
import HNYForm from './HNYForm'
import { formatUnits } from '../../../lib/math-utils'
import { useCourtConfig } from '../../../providers/CourtConfig'

const DeactivateHNY = React.memo(function DeactivateHNY({
  onDeactivateHNY,
  activeBalance,
  onDone,
}) {
  const { anjToken, minActiveBalance } = useCourtConfig()
  const maxAmount = activeBalance

  const minActiveBalanceFormatted = formatUnits(minActiveBalance, {
    digits: anjToken.decimals,
  })
  const maxAmountFormatted = formatUnits(maxAmount, {
    digits: anjToken.decimals,
    precision: anjToken.decimals,
  })

  const validation = useCallback(
    amountBN => {
      const activeBalanceAfter = activeBalance.sub(amountBN)

      if (amountBN.gt(maxAmount)) {
        return `Insufficient funds, you cannnot deactivate more than ${maxAmountFormatted} ${anjToken.symbol}`
      }

      if (activeBalanceAfter.lt(minActiveBalance) && activeBalanceAfter.gt(0)) {
        return `Your resulting active balance must be 0 or at least the minimum to be a keeper (${minActiveBalanceFormatted} ${anjToken.symbol})`
      }

      return null
    },
    [
      activeBalance,
      anjToken.symbol,
      maxAmount,
      maxAmountFormatted,
      minActiveBalance,
      minActiveBalanceFormatted,
    ]
  )

  return (
    <HNYForm
      actionLabel="Deactivate"
      maxAmount={maxAmount}
      onSubmit={onDeactivateHNY}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default DeactivateHNY
