import React from 'react'
import { Button, GU, Info } from '@aragon/ui'
import { useWallet } from '../../../providers/Wallet'


function DisputeSettlePenalties({ disputeId, rounds, onSettlePenalties }) {
  const wallet = useWallet()

  const isAllRoundSettled = rounds.filter(round => !round.settledPenalties).length !== 0

  return (
    <div>
      {
        isAllRoundSettled && 
          <Info>
              You can now start to settle penalties for each round in order to be eligible to get fees.
              NOTE: If the dispute contains multiple rounds, you will be able to settle penalties for the next round
              only if the previous round has been settled.
          </Info>
      }
     
      {
        rounds.map((round, index) => {
          if(!round.settledPenalties) {
            return <Button
                      onClick={() => onSettlePenalties(disputeId, round.number)}
                      key={index}
                      disabled={!wallet.account}
                      wide
                      mode="strong"
                      css={`
                        margin-bottom: ${1.5 * GU}px;
                      `}
                    >
                    Settle Penalties for round #{round.number}
                    </Button>
          }
          else{
            return <Info key={index}>
              The round #{round.number} has already been settled
            </Info>
          }
        })
      }
   
    </div>
  )
}
export default DisputeSettlePenalties
