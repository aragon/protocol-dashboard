import { addressesEqual } from '../lib/web3-utils'
import { isvoteLeaked } from './crvoting-utils'
import { bigNum } from '../lib/math-utils'
import { toMs } from './date-utils'

export function getGuardianDraft(round, guardianId) {
  if (!round) return null

  return round.guardians.find(guardianDraft =>
    addressesEqual(guardianDraft.guardian.id, guardianId)
  )
}

export function hasGuardianVoted(guardianDraft) {
  return !!guardianDraft.commitment
}

export function canGuardianReveal(guardianDraft) {
  const hasNotRevealed = !guardianDraft.outcome
  return (
    hasNotRevealed &&
    hasGuardianVoted(guardianDraft) &&
    !isvoteLeaked(guardianDraft.outcome)
  )
}

export function isGuardianCoherent(guardianDraft) {
  const { dispute } = guardianDraft.round
  return dispute.finalRuling !== 0 && guardianDraft.outcome === dispute.finalRuling
}

export function transformGuardianDataAttributes(guardianDraft) {
  const { rewardedAt, round, weight } = guardianDraft

  return {
    ...guardianDraft,
    rewardedAt: toMs(parseInt(rewardedAt || 0, 10)),
    weight: bigNum(weight),
    round: {
      ...round,
      number: parseInt(round.number, 10),
      collectedTokens: bigNum(round.collectedTokens),
      guardianFees: bigNum(round.guardianFees),
    },
  }
}
