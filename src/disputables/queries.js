import gql from 'graphql-tag'
import { Client } from 'urql'
import { getSubgraphByAppId } from './connect-endpoints'

export function performDisputableProposalQuery(
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
      script
    }
  }
`
