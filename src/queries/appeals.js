import gql from 'graphql-tag'

// TODO:GIORGI from guardiansNumber to guardiansNumber
export const AppealsByMaker = gql`
  query AppealsByMaker($maker: Bytes!) {
    appeals(where: { maker: $maker }) {
      id
      round {
        number
        settledPenalties
        dispute {
          id
          finalRuling
          lastRoundId
          rounds {
            guardiansNumber
            number
          }
        }
      }
      maker
      appealedRuling
      appealDeposit
      opposedRuling
      confirmAppealDeposit
      settled
      settledAt
    }
  }
`

export const AppealsByTaker = gql`
  query AppealsByTaker($taker: Bytes!) {
    appeals(where: { taker: $taker }) {
      id
      round {
        number
        settledPenalties
        dispute {
          id
          finalRuling
          lastRoundId
          rounds {
            guardiansNumber
            number
          }
        }
      }
      appealedRuling
      appealDeposit
      taker
      opposedRuling
      confirmAppealDeposit
      settled
      settledAt
    }
  }
`
