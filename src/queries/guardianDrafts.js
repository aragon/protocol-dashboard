import gql from 'graphql-tag'

// All guardian drafts by guardian with address `id`
export const GuardianDraftsRewards = gql`
  query GuardianDraftsRewards($id: ID!) {
    guardian(id: $id) {
      id
      drafts {
        id
        rewarded
        rewardedAt
        weight
        outcome
        round {
          number
          coherentGuardians
          collectedTokens
          guardianFees
          settledPenalties
          draftTermId
          dispute {
            id
            finalRuling
          }
        }
      }
    }
  }
`

// Guardians drafts for guardian with id `$id` created since `$from`
export const GuardianDraftsFrom = gql`
  query GuardianDraftsFrom($id: ID!, $from: BigInt!) {
    guardian(id: $id) {
      id
      drafts(where: { createdAt_gt: $from }) {
        id
        createdAt
      }
    }
  }
`

// All guardian drafts for guardian with id `id`
// Useful query to know all disputes that the guardian by `$id` is part of
export const GuardianDrafts = gql`
  query GuardianDrafts($id: ID!) {
    guardian(id: $id) {
      id
      drafts {
        id
        round {
          id
          dispute {
            id
          }
        }
      }
    }
  }
`
