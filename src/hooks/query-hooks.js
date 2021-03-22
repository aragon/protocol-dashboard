import { useQuery } from 'urql'

import { GuardianFirstANTActivationMovement } from '../queries/balances'
import { ActiveGuardians, GuardianFeesClaimed } from '../queries/guardian'
import { GuardianDrafts } from '../queries/guardianDrafts'

export function useGuardianDraftQuery(guardianId) {
  const [result] = useQuery({
    query: GuardianDrafts,
    variables: { id: guardianId?.toLowerCase() },
    pause: !guardianId,
  })

  if (result.fetching || result.error) {
    return []
  }

  const { guardian } = result.data || {}

  return guardian ? guardian.drafts.map(draft => draft.round.dispute.id) : []
}

/**
 * Queries if the guardian  by id `guardianId` has ever claimed rewards
 * Rewards can be claimed from two places: Subscriptions fees or Dispute fees (the later includes appeal and guardian fees)
 *
 * @param {String} guardianId Address of the guardian
 * @returns {Boolean} True if guardian has ever claimed rewards
 */
export function useGuardianRewardsEverClaimedQuery(guardianId) {
  const [{ data }] = useQuery({
    query: GuardianFeesClaimed,
    variables: { owner: guardianId.toLowerCase() },
  })

  if (!data) {
    return false
  }

  return data.feeMovements.length > 0
}

export function useFirstANTActivationQuery(guardianId, { pause = false }) {
  const [result] = useQuery({
    query: GuardianFirstANTActivationMovement,
    variables: { id: guardianId.toLowerCase() },
    pause,
  })

  const { guardian } = result.data || {}

  return guardian ? guardian.stakingMovements[0] : null
}

export function useActiveGuardiansNumber() {
  const [{ data, error }] = useQuery({
    query: ActiveGuardians,
  })

  return [data?.guardians?.length, error]
}
