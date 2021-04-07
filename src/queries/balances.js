import gql from 'graphql-tag'

export const GuardianANTBalances = gql`
  query GuardianANTBalances($id: ID!, $from: BigInt!) {
    guardian(id: $id) {
      activeBalance
      lockedBalance
      availableBalance
      deactivationBalance
      withdrawalsLockTermId
      stakingMovements(
        orderBy: createdAt
        orderDirection: desc
        where: { createdAt_gt: $from }
      ) {
        amount
        effectiveTermId
        createdAt
        type
      }
      shareClaims {
        id
        period {
          id
        }
      }
    }
  }
`

export const GuardianTreasuryBalances = gql`
  query GuardianTreasuryBalances($owner: Bytes!) {
    treasuryBalances(where: { owner: $owner }) {
      token {
        id
      }
      amount
    }
  }
`

export const GuardianFirstANTActivationMovement = gql`
  query GuardianFirstANTActivationMovement($id: ID!) {
    guardian(id: $id) {
      stakingMovements(
        where: { type: "Activation" }
        orderBy: createdAt
        orderDirection: asc
        first: 1
      ) {
        amount
        effectiveTermId
        createdAt
        type
      }
    }
  }
`
