import React, { useCallback } from 'react'
import ANTForm from './ANTForm'
import { formatUnits } from '../../../lib/math-utils'
import { useCourtConfig } from '../../../providers/CourtConfig'
import { getANTToken } from '../../../utils/known-tokens'

const DeactivateANT = React.memo(function DeactivateANT({
  onDeactivateANT,
  activeBalance,
  onDone,
}) {
  const { minActiveBalance } = useCourtConfig()
  const antToken = getANTToken()
  const maxAmount = activeBalance

  const minActiveBalanceFormatted = formatUnits(minActiveBalance, {
    digits: antToken.decimals,
  })
  const maxAmountFormatted = formatUnits(maxAmount, {
    digits: antToken.decimals,
    precision: antToken.decimals,
  })

  const validation = useCallback(
    amountBN => {
      const activeBalanceAfter = activeBalance.sub(amountBN)

      if (amountBN.gt(maxAmount)) {
        return `Insufficient funds, you cannnot deactivate more than ${maxAmountFormatted} ${antToken.symbol}`
      }

      if (activeBalanceAfter.lt(minActiveBalance) && activeBalanceAfter.gt(0)) {
        return `Your resulting active balance must be 0 or at least the minimum to be a guardian (${minActiveBalanceFormatted} ${antToken.symbol})`
      }

      return null
    },
    [
      activeBalance,
      antToken.symbol,
      maxAmount,
      maxAmountFormatted,
      minActiveBalance,
      minActiveBalanceFormatted,
    ]
  )

  return (
    <ANTForm
      actionLabel="Deactivate"
      maxAmount={maxAmount}
      onSubmit={onDeactivateANT}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default DeactivateANT
