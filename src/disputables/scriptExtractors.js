import { getContract } from '../web3-contracts'
import { performDisputableVotingQuery } from './queries'

import disputableConvictionVotingAbi from '../abi/disputables/DisputableConvictionVoting.json'
import disputableDandelionVotingAbi from '../abi/disputables/DisputableDandelionVoting.json'
import disputableDelayAbi from '../abi/disputables/DisputableDelay.json'
import tokenAbi from '../abi/ERC20.json'
import { formatTokenAmount } from '../lib/math-utils'

export async function convictionVotingExtractor(
  disputableAddress,
  disputableActionId
) {
  const disputableConvictionVotingContract = getContract(
    disputableAddress,
    disputableConvictionVotingAbi
  )
  const result = await disputableConvictionVotingContract.getProposal(
    disputableActionId
  )

  const requestedAmount = result[0]
  const isStableRequestAmount = result[1]

  if (requestedAmount.eq('0')) {
    return { script: '0x' }
  }

  const tokenAddress = await disputableConvictionVotingContract[
    isStableRequestAmount ? 'stableToken' : 'requestToken'
  ]()

  const tokenContract = getContract(tokenAddress, tokenAbi)
  const [tokenSymbol, tokenDecimals] = await Promise.all([
    tokenContract.symbol(),
    tokenContract.decimals(),
  ])

  return {
    description: `Requesting ${formatTokenAmount(
      requestedAmount,
      false,
      tokenDecimals
    )} ${tokenSymbol} from the DAO's common pool`,
  }
}

export async function delayExtractor(disputableAddress, disputableActionId) {
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

export async function dandelionVotingExtractor(
  disputableAddress,
  disputableActionId
) {
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

export async function votingExtractor(
  disputableAddress,
  disputableActionId,
  disputableAppId
) {
  const { data } = await performDisputableVotingQuery(
    disputableAddress,
    disputableActionId,
    disputableAppId
  )

  if (!data?.disputableVoting?.votes?.length) {
    throw new Error('Failed to fetch evmScript from subgraph')
  }

  return { script: data.disputableVoting.votes[0].script }
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
