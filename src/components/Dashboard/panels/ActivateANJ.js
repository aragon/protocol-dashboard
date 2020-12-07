import React, { useCallback } from 'react'
import ANJForm from './ANJForm'
import { useCourtClock } from '../../../providers/CourtClock'
import { useCourtConfig } from '../../../providers/CourtConfig'
import { useMaxActiveBalance } from '../../../hooks/useCourtContracts'
import { bigNum, formatUnits, max, min } from '../../../lib/math-utils'

const ActivateANJ = React.memo(function ActivateANJ({
  onActivateANJ,
  activeBalance,
  walletBalance,
  inactiveBalance,
  fromWallet,
  onDone,
}) {
  const { currentTermId } = useCourtClock()

  const maxActiveBalance = useMaxActiveBalance(currentTermId)
  const maxToActivate = max(maxActiveBalance.sub(activeBalance), bigNum(0))

  const maxAmount = min(
    fromWallet ? walletBalance : inactiveBalance,
    maxToActivate
  )

  const { anjToken, minActiveBalance } = useCourtConfig()

  const minActiveBalanceFormatted = formatUnits(minActiveBalance, {
    digits: anjToken.decimals,
  })
  const maxToActivateFormatted = formatUnits(maxToActivate, {
    digits: anjToken.decimals,
    precision: anjToken.decimals,
  })
  const maxAmountFormatted = formatUnits(maxAmount, {
    digits: anjToken.decimals,
    precision: anjToken.decimals,
  })

  const validation = useCallback(
    amountBN => {
      if (amountBN.gt(maxAmount)) {
        if (amountBN.gt(maxToActivate)) {
          return `You cannot activate more than ${maxToActivateFormatted} ${anjToken.symbol}`
        }

        return `Insufficient funds, your ${
          fromWallet
            ? 'wallet balance is'
            : 'inactive balance available for activation is'
        } ${maxAmountFormatted} ${anjToken.symbol} `
      }

      if (activeBalance.add(amountBN).lt(minActiveBalance)) {
        return `You must have at least ${minActiveBalanceFormatted} ${anjToken.symbol} activated`
      }

      return null
    },
    [
      activeBalance,
      anjToken.symbol,
      fromWallet,
      maxAmount,
      maxAmountFormatted,
      maxToActivate,
      maxToActivateFormatted,
      minActiveBalance,
      minActiveBalanceFormatted,
    ]
  )

  return (
    <ANJForm
      actionLabel="Activate"
      maxAmount={maxAmount}
      onSubmit={onActivateANJ}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default ActivateANJ
