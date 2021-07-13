import gql from 'graphql-tag'

export const CourtConfig = gql`
  query CourtConfig($id: ID!) {
    court(id: $id) {
      id
      token {
        id
        name
        address: id
        symbol
        decimals
      }
      currentTerm
      termDuration
      feeToken {
        id
        name
        symbol
        decimals
      }
      guardianFee
      draftFee
      settleFee

      evidenceTerms
      commitTerms
      revealTerms
      appealTerms
      appealConfirmationTerms
      terms {
        id
        startTime
      }
      finalRoundReduction
      firstRoundGuardiansNumber
      appealStepFactor
      maxRegularAppealRounds
      appealCollateralFactor
      appealConfirmCollateralFactor
      minActiveBalance
      penaltyPct
      modules {
        id
        type
      }
      terms {
        id
        startTime
      }
    }
  }
`
export const GuardiansRegistryModule = gql`
  query GuardiansRegistryModule($id: ID!) {
    guardiansRegistryModule(id: $id) {
      id
      totalStaked
      totalActive
    }
  }
`

export const FeeMovements = gql`
  query FeeMovements {
    feeMovements(where: { type_not: Withdraw }) {
      id
      type
      amount
      createdAt
    }
  }
`
