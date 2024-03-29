import { useMemo } from 'react'

import { useWallet } from '../providers/Wallet'
import { useCourtClock } from '../providers/CourtClock'
import { useCourtConfig } from '../providers/CourtConfig'
import { useFirstANTActivationQuery } from './query-hooks'
import { useDashboardState } from '../components/Dashboard/DashboardStateProvider'

import {
  isMovementOf,
  convertMovement,
  isMovementEffective,
  getUpdatedLockedMovement,
  getLatestMovementByBalance,
  acceptedMovementsPerBalance,
  getAmountNotEffectiveByBalance,
} from '../utils/ant-movement-utils'
import { getTermStartTime } from '../utils/court-utils'
import { getDraftLockAmount } from '../utils/dispute-utils'
import { ANTBalance, ANTMovement } from '../types/ant-types'

export function useANTBalances() {
  const { antBalances, stakingMovements } = useDashboardState()

  const {
    walletBalance,
    activeBalance,
    lockedBalance,
    inactiveBalance,
    deactivationBalance,
  } = antBalances || {}

  const convertedMovements = useConvertedMovements(stakingMovements)

  const convertedWalletBalance = useBalanceWithMovements(
    walletBalance,
    convertedMovements,
    ANTBalance.Wallet
  )

  const convertedInactiveBalance = useBalanceWithMovements(
    inactiveBalance,
    convertedMovements,
    ANTBalance.Inactive
  )

  const convertedActiveBalance = useBalanceWithMovements(
    activeBalance,
    convertedMovements,
    ANTBalance.Active
  )

  // Use ANT Locked distribution
  const lockedDistribution = useGuardianLockedANTDistribution()
  const convertedLockedBalance = useMemo(() => {
    return { amount: lockedBalance, distribution: lockedDistribution }
  }, [lockedBalance, lockedDistribution])

  const convertedDeactivationBalance = useMemo(() => {
    return { amount: deactivationBalance }
  }, [deactivationBalance])

  // Since we pass the whole object through props to components, we should memoize it
  return useMemo(() => {
    if (!antBalances) {
      return null
    }

    return {
      walletBalance: convertedWalletBalance,
      inactiveBalance: convertedInactiveBalance,
      activeBalance: convertedActiveBalance,
      lockedBalance: convertedLockedBalance,
      deactivationBalance: convertedDeactivationBalance,
    }
  }, [
    antBalances,
    convertedActiveBalance,
    convertedDeactivationBalance,
    convertedInactiveBalance,
    convertedLockedBalance,
    convertedWalletBalance,
  ])
}

// Asummes movements in descending order of creation
function useConvertedMovements(movements) {
  const { currentTermId } = useCourtClock()
  const courtConfig = useCourtConfig()

  const effectiveStates = movements
    ? movements.map(mov => isMovementEffective(mov, currentTermId))
    : []
  const effectiveStatesKey = effectiveStates.join('')

  return useMemo(
    () => {
      if (!movements) {
        return null
      }

      // Since Activation, Deactivations and Slashing movements are effective on next term of creation
      // but only Deactivations don't update the balance immediately, we'll use another attr (isImmediate) to differentiate these cases
      return movements
        .map((mov, i) => {
          const isImmediate = ANTMovement[mov.type] !== ANTMovement.Deactivation

          let updatesBalanceAt = mov.createdAt
          if (!isImmediate && mov.effectiveTermId && effectiveStates[i]) {
            const termStartTimeMs = getTermStartTime(
              mov.effectiveTermId,
              courtConfig
            )
            updatesBalanceAt = termStartTimeMs / 1000
          }

          return {
            ...mov,
            isEffective: effectiveStates[i],
            updatesBalanceAt,
            isImmediate,
          }
        })
        .sort((mov1, mov2) => {
          // We are resorting movements by time they update the balance at
          if (mov1.updatesBalanceAt === mov2.updatesBalanceAt) {
            return mov2.createdAt - mov1.createdAt
          }

          return mov2.updatesBalanceAt - mov1.updatesBalanceAt
        })
    },
    [effectiveStatesKey, movements] //eslint-disable-line
  )
}

/**
 * Calculates total amount, total not effective amount and the latest movement for `balanceType`
 * @dev In case the balance is active or inactive, we must also calculate all non effective movements to get the effective balance at current term
 *
 * @param {BigNum} balance Total balance amount
 * @param {Array} movements Latest 24h movements
 * @param {Symbol} balanceType Type of balance (Wallet, Inactive, Active)
 * @returns {Object} Converted balance
 */
function useBalanceWithMovements(balance, movements, balanceType) {
  const { antBalances } = useDashboardState()
  const { lockedBalance } = antBalances || {}

  const acceptedMovements = acceptedMovementsPerBalance.get(balanceType)
  const filteredMovements = useFilteredMovements(movements, acceptedMovements)

  return useMemo(() => {
    if (!balance) {
      return null
    }

    // Calculate total not effective (If balanceType === wallet returns 0)
    const amountNotEffective = getAmountNotEffectiveByBalance(
      movements,
      balanceType
    )

    // Get latest movement
    let latestMovement = getLatestMovementByBalance(
      filteredMovements,
      balanceType
    )

    // Update latest movement if necessary
    if (balanceType === ANTBalance.Active) {
      if (lockedBalance?.gt(0))
        latestMovement = getUpdatedLockedMovement(lockedBalance, latestMovement)
    }

    return {
      amount: balance,
      amountNotEffective,
      latestMovement: convertMovement(acceptedMovements, latestMovement),
    }
  }, [
    acceptedMovements,
    balance,
    balanceType,
    filteredMovements,
    lockedBalance,
    movements,
  ])
}

function useFilteredMovements(movements, acceptedMovements) {
  return useMemo(() => {
    if (!movements) {
      return null
    }
    return movements.filter(movement => {
      return isMovementOf(acceptedMovements, ANTMovement[movement.type])
    })
  }, [acceptedMovements, movements])
}

/**
 * @param {Object} options query options
 * @param {Boolean} options.pause Tells whether to pause query or not
 * @return {Boolean} true if account's first ANT activation happened on current term
 */
export function useGuardianFirstTimeANTActivation(options) {
  const wallet = useWallet()
  const { currentTermId } = useCourtClock()
  const firstANTActivation = useFirstANTActivationQuery(wallet.account, options)

  if (!firstANTActivation) return false

  const firstANTActivationTerm = parseInt(
    firstANTActivation.effectiveTermId,
    10
  )

  // Activation is effective on next term from when the activation was performed
  return firstANTActivationTerm === currentTermId + 1
}

export function useGuardianLockedANTDistribution() {
  const {
    maxRegularAppealRounds,
    minActiveBalance,
    penaltyPct,
  } = useCourtConfig()
  const { guardianDrafts, antBalances } = useDashboardState()
  const { lockedBalance } = antBalances || {}

  return useMemo(() => {
    if (!lockedBalance || lockedBalance.eq(0) || !guardianDrafts) return null

    // For final rounds the ANT at stake is pre-slashed for all guardians when they commit their vote
    return guardianDrafts
      .filter(
        guardianDraft =>
          !guardianDraft.round.settledPenalties &&
          guardianDraft.round.number < maxRegularAppealRounds
      )
      .reduce((lockDistribution, { weight, round }) => {
        const { dispute } = round

        // Since the subgraph cannot provide a way to tell how much was locked per draft we calculate it ourselves
        // See https://github.com/aragon/court-subgraph/blob/7f0fec5c8953e9dbd67e5607fb6da03f69a60f40/src/DisputeManager.ts#L57
        const lockedAmount = getDraftLockAmount(
          minActiveBalance,
          penaltyPct,
          weight
        )

        const index = lockDistribution.findIndex(
          locks => locks.disputeId === dispute.id
        )

        if (index >= 0) {
          const elem = lockDistribution[index]

          // Replace with updated amount and weight
          lockDistribution.splice(index, 1, {
            ...elem,
            amount: elem.amount.add(lockedAmount),
            weight: elem.weight.add(weight),
          })
        } else {
          lockDistribution.push({
            disputeId: dispute.id,
            amount: lockedAmount,
            weight,
          })
        }

        return lockDistribution
      }, [])
  }, [
    guardianDrafts,
    lockedBalance,
    maxRegularAppealRounds,
    minActiveBalance,
    penaltyPct,
  ])
}
