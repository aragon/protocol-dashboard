import { getContract } from '../web3-contracts'
import {
  performDisputableProposalQuery,
  performDisputableVotingQuery,
} from './queries'

import disputableConvictionVotingAbi from '../abi/disputables/DisputableConvictionVoting.json'
import disputableDandelionVotingAbi from '../abi/disputables/DisputableDandelionVoting.json'
import disputableDelayAbi from '../abi/disputables/DisputableDelay.json'
import tokenAbi from '../abi/ERC20.json'
import { bigNum, formatTokenAmount } from '../lib/math-utils'

// TODO: Make a general propsoal extractor, ideally by arbitrable
export async function convictionVotingExtractor({
  disputableAddress,
  disputableActionId,
  disputableAppId,
  disputeId,
}) {
  const disputableConvictionVotingContract = getContract(
    disputableAddress,
    disputableConvictionVotingAbi
  )
  const { data } = await performDisputableProposalQuery(
    disputableActionId,
    disputableAppId,
    disputeId
  )

  if (!data?.proposals?.length) {
    throw new Error('Failed to fetch description from subgraph')
  }
  const proposal = data.proposals[0]
  const requestedAmount = bigNum(proposal.requestedAmount)

  // Signaling proposal
  if (requestedAmount.eq('0')) {
    return { description: data.proposals[0].metadata }
  }

  // Proposal requesting funds
  const tokenAddress = await disputableConvictionVotingContract[
    proposal.stable ? 'stableToken' : 'requestToken'
  ]()

  const tokenContract = getContract(tokenAddress, tokenAbi)
  const [tokenSymbol, tokenDecimals] = await Promise.all([
    tokenContract.symbol(),
    tokenContract.decimals(),
  ])

  return {
    description: `${proposal.metadata} \n- Requesting ${formatTokenAmount(
      requestedAmount,
      false,
      tokenDecimals
    )} ${tokenSymbol} from the DAO's common pool`,
  }
}

export async function delayExtractor({
  disputableAddress,
  disputableActionId,
}) {
  return {
    script: await extractFromContract(
      disputableDelayAbi,
      disputableAddress,
      disputableActionId,
      'delayedScripts',
      4
    ),
  }
}

export async function dandelionVotingExtractor({
  disputableAddress,
  disputableActionId,
}) {
  return {
    script: await extractFromContract(
      disputableDandelionVotingAbi,
      disputableAddress,
      disputableActionId,
      'getVote',
      10
    ),
  }
}

export async function votingExtractor({
  disputableActionId,
  disputableAppId,
  disputeId,
}) {
  const { data } = await performDisputableVotingQuery(
    disputableActionId,
    disputableAppId,
    disputeId
  )

  if (!data?.proposals?.length) {
    throw new Error('Failed to fetch evmScript from subgraph')
  }

  return { script: data.proposals[0].script }
}

async function extractFromContract(
  abi,
  disputableAddress,
  disputableActionId,
  fn,
  scriptPosition
) {
  const disputableAppContract = getContract(disputableAddress, abi)

  // Fetch the evmScript via contract call
  const result = await disputableAppContract[fn](disputableActionId)
  return result[scriptPosition]
}
