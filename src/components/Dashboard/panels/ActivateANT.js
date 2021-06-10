import React, { useCallback } from 'react'
import ANTForm from './ANTForm'
import { formatUnits } from '../../../lib/math-utils'
import { useCourtConfig } from '../../../providers/CourtConfig'

const ActivateANT = React.memo(function ActivateANT({
  onActivateANT,
  activeBalance,
  walletBalance,
  inactiveBalance,
  fromWallet,
  onDone,
  label
}) {

  const { minActiveBalance, token: antToken } = useCourtConfig()
  const maxAmount = fromWallet ? walletBalance : inactiveBalance

  const minActiveBalanceFormatted = formatUnits(minActiveBalance, {
    digits: antToken.decimals,
  })
  const maxAmountFormatted = formatUnits(maxAmount, {
    digits: antToken.decimals,
    precision: antToken.decimals,
  })

  const validation = useCallback(
    amountBN => {
      if (amountBN.gt(maxAmount)) {
        return `Insufficient funds, your ${
          fromWallet
            ? 'wallet balance is'
            : 'inactive balance available for activation is'
        } ${maxAmountFormatted} ${antToken.symbol} `
      }

      if (activeBalance.add(amountBN).lt(minActiveBalance)) {
        return `You must have at least ${minActiveBalanceFormatted} ${antToken.symbol} activated`
      }

      return null
    },
    [
      activeBalance,
      antToken.symbol,
      fromWallet,
      maxAmount,
      maxAmountFormatted,
      minActiveBalance,
      minActiveBalanceFormatted,
    ]
  )

  return (
    <ANTForm
      actionLabel={label}
      maxAmount={maxAmount}
      onSubmit={onActivateANT}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default ActivateANT
