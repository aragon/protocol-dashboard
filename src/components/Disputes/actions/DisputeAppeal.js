import React, { useCallback } from 'react'
import { Button, GU, Info, Link } from '@aragon/ui'
import { useWallet } from '../../../providers/Wallet'

function DisputeAppeal({ onRequestAppeal, confirm }) {
  const wallet = useWallet()

  const actionLabel = confirm ? 'Confirm appeal' : 'Appeal Decision'

  const handleRequestAppeal = useCallback(() => {
    onRequestAppeal(confirm)
  }, [confirm, onRequestAppeal])

  return (
    <div>
      <Button
        wide
        mode="strong"
        onClick={handleRequestAppeal}
        css={`
          margin-bottom: ${1.5 * GU}px;
        `}
        disabled={!wallet.account}
      >
        {actionLabel}
      </Button>
      <Info>
        <strong>Anyone</strong> can{' '}
        <strong>
          lock DAI as collateral to{' '}
          {confirm ? 'confirm an appeal' : 'initiate an appeal'}{' '}
        </strong>
        if they believe the{' '}
        {confirm ? 'decision appealed for' : 'current outcome'} is incorrect.
        When the final decision is confirmed, the user who{' '}
        {confirm ? 'confirmed the appeal' : 'appealed'} gets rewarded if the
        decision has switched in their favor. If not, their entire collateral
        could be re-distributed to the winning party. {confirm ? 'When' : 'If'}{' '}
        an appeal is confirmed, a new adjudication round is initiated and a new
        group of guardians is summoned.{' '}
        <Link href="https://help.aragon.org/article/43-dispute-lifecycle#appeal">
          Learn more
        </Link>
        .
      </Info>
    </div>
  )
}

export default DisputeAppeal
