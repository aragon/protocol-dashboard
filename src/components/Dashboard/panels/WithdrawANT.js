import React, { useCallback } from 'react'
import ANTForm from './ANTForm'
import { formatUnits } from '../../../lib/math-utils'
import { getANTToken } from '../../../utils/known-tokens'

const WithdrawANT = React.memo(function WithdrawANT({
  onWithdrawANT,
  inactiveBalance,
  onDone,
}) {
  const antToken = getANTToken()

  const maxAmount = inactiveBalance
  const maxAmountFormatted = formatUnits(maxAmount, {
    digits: antToken.decimals,
    precision: antToken.decimals,
  })

  const validation = useCallback(
    amountBN => {
      if (amountBN.gt(maxAmount)) {
        return `Insufficient funds, you cannnot withdraw more than ${maxAmountFormatted} ${antToken.symbol}`
      }

      return null
    },
    [antToken.symbol, maxAmount, maxAmountFormatted]
  )

  return (
    <ANTForm
      actionLabel="Withdraw"
      maxAmount={maxAmount}
      onSubmit={onWithdrawANT}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default WithdrawANT
