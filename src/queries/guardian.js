import gql from 'graphql-tag'

// First guardian subscription claimed
export const GuardianFeesClaimed = gql`
  query GuardianFeesClaimed($owner: Bytes!) {
    feeMovements(where: { owner: $owner }) {
      id
    }
  }
`

// Last guardian fee withdrawal movement
export const GuardianLastFeeWithdrawal = gql`
  query GuardianLastFeeWithdrawal($owner: Bytes!) {
    feeMovements(
      where: { owner: $owner, type: "Withdraw" }
      orderBy: createdAt
      orderDirection: desc
      first: 1
    ) {
      id
      createdAt
    }
  }
`

export const ActiveGuardians = gql`
  query ActiveGuardians {
    guardians(first: 1000, where: { activeBalance_gt: 0 }) {
      id
    }
  }
`
