import gql from 'graphql-tag'

export const JurorANTWalletBalance = gql`
  query JurorANTWalletBalance($id: ID!) {
    antbalance(id: $id) {
      amount
    }
  }
`

export const JurorANTBalances = gql`
  query JurorANTBalances($id: ID!, $from: BigInt!) {
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

export const JurorTreasuryBalances = gql`
  query JurorTreasuryBalances($owner: Bytes!) {
    treasuryBalances(where: { owner: $owner }) {
      token {
        id
      }
      amount
    }
  }
`

export const JurorFirstANTActivationMovement = gql`
  query JurorFirstANTActivationMovement($id: ID!) {
    juror(id: $id) {
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
