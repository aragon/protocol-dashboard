import React, { useCallback } from 'react'
import ANTForm from './ANTForm'
import { formatUnits } from '../../../lib/math-utils'

const UnlockActivation = React.memo(function DeactivateANT({
  onUnlockActivation,
  lockedBalance,
  onDone,
}) {
    const formattedLocked = formatUnits(lockedBalance)
    const validation = useCallback(
        amountBN => {
            if (amountBN.gt(lockedBalance)) {
                return `Insufficient funds, you cannnot unlock more than ${formattedLocked}`
            }
            return null
        },
        [
            lockedBalance,
            formattedLocked
        ]
    )

  return (
    <ANTForm
      actionLabel="Unlock"
      maxAmount={lockedBalance}
      onSubmit={onUnlockActivation}
      onDone={onDone}
      runParentValidation={validation}
    />
  )
})

export default UnlockActivation
