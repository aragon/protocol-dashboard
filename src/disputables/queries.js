import gql from 'graphql-tag'
import { Client } from 'urql'
import { getSubgraphByAppId } from './connect-endpoints'

export function performDisputableProposalQuery(
  disputableAddress,
  disputableActionId,
  disputableAppId,
  disputeId
) {
  // Disputable voting now saves the hash of the evmScript so we need to get it from the subgraph.
  const subgraphUrl = getSubgraphByAppId(disputableAppId)

  return performQuery(subgraphUrl, disputableProposalQuery, {
    proposalId: disputableActionId,
    disputeId,
  })
}

export function performDisputableVotingQuery(
  disputableAddress,
  disputableActionId,
  disputableAppId,
  disputeId
) {
  // Disputable voting now saves the hash of the evmScript so we need to get it from the subgraph.
  const subgraphUrl = getSubgraphByAppId(disputableAppId)

  return performQuery(subgraphUrl, disputableVotingQuery, {
    id: disputableAddress,
    voteId: disputableActionId,
  })
}

function performQuery(subgraph, query, args) {
  const client = new Client({ url: subgraph })

  return client.query(query, args).toPromise()
}

const disputableProposalQuery = gql`
  query Proposal($proposalId: BigInt!, $disputeId: BigInt!) {
    proposals(where: { number: $proposalId, disputeId: $disputeId }) {
      id
      requestedAmount
      metadata
      stable
    }
  }
`

const disputableVotingQuery = gql`
  query DisputableVoting($id: ID!, $voteId: BigInt!) {
    disputableVoting(id: $id) {
      votes(where: { voteId: $voteId }) {
        script
      }
    }
  }
`
