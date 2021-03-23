/* eslint-disable */ 
// TODO:GIORGI enable it again above.
import { useMemo, useEffect, useState } from 'react'
import { useQuery } from 'urql'
import { useCourtConfig } from '../providers/CourtConfig'

// queries
import { OpenTasks } from '../queries/tasks'
import {
  CourtConfig,
  FeeMovements,
  GuardiansRegistryModule,
} from '../queries/court'
import { AllDisputes, SingleDispute } from '../queries/disputes'
import { AppealsByMaker, AppealsByTaker } from '../queries/appeals'
import {
  GuardianANTBalances,
  GuardianANTWalletBalance,
  GuardianTreasuryBalances,
} from '../queries/balances'
import { GuardianDraftsFrom, GuardianDraftsRewards } from '../queries/guardianDrafts'

// utils
import { bigNum } from '../lib/math-utils'
import { dayjs, toMs } from '../utils/date-utils'
import { groupMovements } from '../utils/ant-movement-utils'
import { transformAppealDataAttributes } from '../utils/appeal-utils'
import {
  transformRoundDataAttributes,
  transformDisputeDataAttributes,
} from '../utils/dispute-utils'
import { transformGuardianDataAttributes } from '../utils/guardian-draft-utils'
import { transformClaimedFeesDataAttributes } from '../utils/subscription-utils'
import {
  getModuleAddress,
  transformCourtConfigDataAttributes,
} from '../utils/court-utils'

// types
import { CourtModuleType } from '../types/court-module-types'
import { GuardianLastFeeWithdrawal } from '../queries/guardian'

import { useANTTokenContract } from './useCourtContracts'

const NO_AMOUNT = bigNum(0)

function useQuerySub(query, variables = {}, options = {}) {
  return useQuery({
    query: query,
    variables: variables,
    requestPolicy: 'cache-and-network',
    pollInterval: 13 * 1000,
    ...options,
  })
}

// Subscription to get guardian's wallet balance
function useANTBalance(guardianId) {
  const antTokenContract = useANTTokenContract();
  const error = null
  let [data, setData] = useState({ antbalance: { amount : bigNum(0) }});

  useEffect(() => {
    async function getData() {
      const amount = await antTokenContract.balanceOf(guardianId)
      setData({ antbalance: { amount : bigNum(amount) }} )
    }
    getData();
  }, [])
  
  return { data, error }
}

// Subscription to get guardian's active, inactive and
// locked balances and all 24 hrs movements
function useGuardian(guardianId) {
  // get 24hs from current time (seconds)
  const yesterday = dayjs()
    .subtract(1, 'day')
    .unix()

  const [{ data, error }] = useQuerySub(GuardianANTBalances, {
    id: guardianId.toLowerCase(),
    from: yesterday,
  })

  return { data, error }
}

// Subscription to get all treasury balances of guardian with id `guardianId`
function useGuardianTreasuryBalances(guardianId) {
  const [{ data, error }] = useQuerySub(GuardianTreasuryBalances, {
    owner: guardianId.toLowerCase(),
  })
  return { data, error }
}

/**
 * Subscribes to all guardian balances as well as to the latest 24h movements and all subscription fees claimed by the guardian
 * @param {String} guardianId Address of the guardian
 * @returns {Object} Object containing al guardian balances (Wallet, Inactive, Active, Locked, Deactivation Process, Treasury),
 * latest 24h movements and all subscription fees claimed by the guardian
 */
export function useGuardianBalancesSubscription(guardianId) {
  // Guardian wallet balance
  const { data: antBalanceData, error: antBalanceError } = useANTBalance(
    guardianId
  )

  // Guardian ANT balances, 24h movements and subscritpion claimed fees
  const { data: guardianData, error: guardianError } = useGuardian(guardianId)
  const {
    data: treasuryBalancesData,
    error: treasuryBalancesError,
  } = useGuardianTreasuryBalances(guardianId)

  const errors = [antBalanceError, guardianError, treasuryBalancesError].filter(
    err => err
  )

  const {
    antBalances,
    stakingMovements,
    claimedSubscriptionFees,
    treasury,
  } = useMemo(() => {
    // Means it's still fetching
    if (!guardianData || !antBalanceData || !treasuryBalancesData) {
      return {}
    }

    // If the account doesn't hold any ANT we set 0 as default
    const { amount: walletBalance = NO_AMOUNT } =
      antBalanceData.antbalance || {}

    // If the guardian is null then means that the connnected account is not a guardian but we are already done fetching
    // We set 0 as default values

    const {
      activeBalance = NO_AMOUNT,
      stakingMovements = [],
      availableBalance = NO_AMOUNT,
      claimedSubscriptionFees = [],
      deactivationBalance = NO_AMOUNT,
      lockedBalance = NO_AMOUNT,
    } = guardianData.guardian || {}
  
    const { treasuryBalances = [] } = treasuryBalancesData || {}

    return {
      antBalances: {
        activeBalance: bigNum(activeBalance),
        deactivationBalance: bigNum(deactivationBalance),
        inactiveBalance: bigNum(availableBalance),
        lockedBalance: bigNum(lockedBalance),
        walletBalance: bigNum(walletBalance),
      },
      stakingMovements: groupMovements(stakingMovements),
      claimedSubscriptionFees: claimedSubscriptionFees.map(
        transformClaimedFeesDataAttributes
      ),
      treasury: treasuryBalances.map(balance => ({
        ...balance,
        amount: bigNum(balance.amount),
      })),
    }
  }, [antBalanceData, guardianData, treasuryBalancesData])

  return {
    antBalances,
    stakingMovements,
    claimedSubscriptionFees,
    treasury,
    fetching: !antBalances && errors.length === 0,
    errors,
  }
}

/**
 * Subscribes to the court configuration data
 * @param {String} courtAddress Adrress of the court contract
 * @returns {Object} Court configuration data
 */
export function useCourtConfigSubscription(courtAddress) {
  const [{ data }] = useQuerySub(CourtConfig, {
    id: courtAddress.toLowerCase(),
  })

  // TODO: handle possible errors
  const courtConfig = useMemo(
    () => (data?.court ? transformCourtConfigDataAttributes(data.court) : null),
    [data]
  )

  return courtConfig
}

/**
 * Subscribes to the dispute with id == `id`
 * @param {String} id Id of the dispute
 * @returns {Object} Dispute by `id`
 */
export function useSingleDisputeSubscription(id) {
  const [{ data, error }] = useQuerySub(SingleDispute, { id })

  const dispute = useMemo(
    () =>
      data && data.dispute
        ? transformDisputeDataAttributes(data.dispute)
        : null,
    [data]
  )

  return { dispute, fetching: !data && !error, error }
}

/**
 * Subscribes to all existing disputes on the court
 * @returns {Object} All disputes
 */
export function useDisputesSubscription() {
  const courtConfig = useCourtConfig()
  const [{ data, error }] = useQuerySub(AllDisputes)

  const disputes = useMemo(
    () =>
      data?.disputes
        ? data.disputes.map(dispute =>
            transformDisputeDataAttributes(dispute, courtConfig)
          )
        : null,
    [courtConfig, data]
  )

  return { disputes, fetching: !data && !error, error }
}

/**
 * Subscribe to all `guardianId` drafts for the current term
 * @param {String} guardianId Address of the guardian
 * @param {Number} termStartTime Start time of the term inseconds
 * @param {Boolean} pause Tells whether to pause the subscription or not
 * @returns {Object} All `guardianId` drafts for the current term
 */
export function useCurrentTermGuardianDraftsSubscription(
  guardianId,
  termStartTime,
  pause
) {
  const [result] = useQuerySub(
    GuardianDraftsFrom,
    { id: guardianId.toLowerCase(), from: termStartTime },
    { pause }
  )

  const { guardian } = result.data || {}
  return guardian && guardian.drafts ? guardian.drafts : []
}

/**
 * Subscribes to all `guardianId` drafts
 * @dev This subscription is useful to get all rewards pending for claiming as well
 * as for the amount of locked ANT a guardian has per dispute
 * Ideally we would check that the round is not settled but we cannot do nested filters for now
 *
 * @param {String} guardianId Address of the guardian
 * @returns {Object} All `guardianId` drafts
 */
export function useGuardianDraftsRewardsSubscription(guardianId) {
  const [{ data, error }] = useQuerySub(GuardianDraftsRewards, {
    id: guardianId.toLowerCase(),
  })

  const guardianDrafts = useMemo(() => {
    if (!data) {
      return null
    }

    return data.guardian?.drafts.map(transformGuardianDataAttributes) || []
  }, [data])

  return { guardianDrafts, fetching: !guardianDrafts && !error, error }
}

function useAppealsByMaker(guardianId) {
  const [{ data, error }] = useQuerySub(AppealsByMaker, {
    maker: guardianId.toLowerCase(),
  })
  return { data, error }
}

function useAppealsByTaker(guardianId) {
  const [{ data, error }] = useQuerySub(AppealsByTaker, {
    taker: guardianId.toLowerCase(),
  })
  return { data, error }
}

/**
 * Subscribes to all `guardianId` appeal collaterals
 * @dev Since we cannot do or operators on graphql queries, we need to get appeals by taker and maker separately
 *
 * @param {String} guardianId Address of the guardian
 * @returns {Object} All `guardianId` appeal collaterals
 */
export function useAppealsByUserSubscription(guardianId) {
  const {
    data: makerAppealsData,
    error: makerAppealsError,
  } = useAppealsByMaker(guardianId)
  const {
    data: takerAppealsData,
    error: takerAppealsError,
  } = useAppealsByTaker(guardianId)

  const appeals = useMemo(() => {
    if (!makerAppealsData || !takerAppealsData) {
      return null
    }

    const makerAppeals = makerAppealsData.appeals
    const takerAppeals = takerAppealsData.appeals

    return [...makerAppeals, ...takerAppeals].map(transformAppealDataAttributes)
  }, [makerAppealsData, takerAppealsData])

  const errors = [makerAppealsError, takerAppealsError].filter(err => err)

  return { appeals, fetching: !appeals && errors.length === 0, errors }
}

export function useTasksSubscription() {
  // 1- Committing, 4-Confirming Appeal , 5- Ended
  const subscriptionVariables = { state: [1, 4] }

  const [{ data, error }] = useQuerySub(OpenTasks, subscriptionVariables)

  const tasks =
    data?.adjudicationRounds.map(transformRoundDataAttributes) || null

  return { tasks, fetching: !data && !error, error }
}

export function useGuardianRegistrySubscription() {
  const { modules } = useCourtConfig()
  const guardianRegistryAddress = getModuleAddress(
    modules,
    CourtModuleType.GuardiansRegistry
  )

  const [{ data, error }] = useQuerySub(GuardiansRegistryModule, {
    id: guardianRegistryAddress,
  })

  const guardianRegistryStats = data?.guardiansRegistryModule || null

  return { data: guardianRegistryStats, error }
}

export function useTotalRewardsSubscription() {
  const [{ data, error }] = useQuerySub(FeeMovements)

  const rewards = data?.feeMovements || null

  return { data: rewards, error }
}

/**
 * Queries for the last withdrawal fee movement time made by the given guardian
 * @param {String} guardianId Address of the guardian
 * @returns {Number} Guardian's last withdrawal fee movement date in unix time
 */
export function useGuardianLastWithdrawalTimeSubscription(guardianId) {
  const [{ data }] = useQuerySub(
    GuardianLastFeeWithdrawal,
    { owner: guardianId?.toLowerCase() },
    { pause: !guardianId }
  )

  if (!data) {
    return null
  }

  if (data.feeMovements.length === 0) {
    return -1
  }

  return toMs(data.feeMovements[0].createdAt)
}
