import { useQuery } from 'urql'

import { JurorFirstANTActivationMovement } from '../queries/balances'
import { ActiveJurors, JurorFeesClaimed } from '../queries/juror'
import { JurorDrafts } from '../queries/jurorDrafts'

export function useJurorDraftQuery(jurorId) {
  const [result] = useQuery({
    query: JurorDrafts,
    variables: { id: jurorId?.toLowerCase() },
    pause: !jurorId,
  })

  if (result.fetching || result.error) {
    return []
  }

  const { juror } = result.data || {}

  return juror ? juror.drafts.map(draft => draft.round.dispute.id) : []
}

/**
 * Queries if the juror  by id `jurorId` has ever claimed rewards
 * Rewards can be claimed from two places: Subscriptions fees or Dispute fees (the later includes appeal and juror fees)
 *
 * @param {String} jurorId Address of the juror
 * @returns {Boolean} True if juror has ever claimed rewards
 */
export function useJurorRewardsEverClaimedQuery(jurorId) {
  const [{ data }] = useQuery({
    query: JurorFeesClaimed,
    variables: { owner: jurorId.toLowerCase() },
  })

  if (!data) {
    return false
  }

  return data.feeMovements.length > 0
}

export function useFirstANTActivationQuery(jurorId, { pause = false }) {
  const [result] = useQuery({
    query: JurorFirstANTActivationMovement,
    variables: { id: jurorId.toLowerCase() },
    pause,
  })

  const { juror } = result.data || {}

  return juror ? juror.antMovements[0] : null
}

export function useActiveJurorsNumber() {
  const [{ data, error }] = useQuery({
    query: ActiveJurors,
  })

  return [data?.jurors?.length, error]
}
