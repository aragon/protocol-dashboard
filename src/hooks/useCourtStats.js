import { useMemo } from 'react'
import { useActiveGuardiansNumber } from '../hooks/query-hooks'
import {
  useGuardianRegistrySubscription,
  useTotalRewardsSubscription,
} from '../hooks/subscription-hooks'
import { getKnownToken } from '../utils/known-tokens'
import { bigNum } from '../lib/math-utils'
import IconANT from '../assets/IconANT.svg'
import IconDAI from '../assets/IconDAI.svg'

const COURT_STATS = [
  {
    label: 'Total Active ANT',
    token: { ...getKnownToken('ANT'), icon: IconANT },
  },
  { label: 'Total Active Guardians' },
  {
    label: 'Total Rewards DAI',
    token: { ...getKnownToken('DAI'), icon: IconDAI },
  },
]

export function useTotalActiveBalance() {
  const { data: guardianRegistryStats, error } = useGuardianRegistrySubscription()

  return useMemo(() => {
    if (!guardianRegistryStats || error) {
      return [bigNum(-1), error]
    }
    return [bigNum(guardianRegistryStats.totalActive), error]
  }, [error, guardianRegistryStats])
}

function useTotalRewards() {
  const { data: rewards, error } = useTotalRewardsSubscription()

  return useMemo(() => {
    if (!rewards || error) {
      return [bigNum(-1), error]
    }
    return [
      rewards.reduce(
        (totalAcumulator, reward) => totalAcumulator.add(reward.amount),
        bigNum(0)
      ),
      error,
    ]
  }, [error, rewards])
}
/**
 * Hook to get the dashboard stats ANT active balance, ANT total stake and the active guardians number
 * @returns {Array} First item an array with the stats and the second one a loading state
 */
function useCourtStats() {
  const [antActiveBalance, antActiveBalanceError] = useTotalActiveBalance()
  const [activeGuardians, activeGuardiansError] = useActiveGuardiansNumber()
  const [totalRewards, totalRewardsError] = useTotalRewards()

  // Loading states
  const antFetching = antActiveBalance.eq(bigNum(-1)) && !antActiveBalanceError
  const activeGuardiansFetching = activeGuardians === null && !activeGuardiansError
  const totalRewardsFetching = totalRewards.eq(bigNum(-1)) && !totalRewardsError

  return useMemo(
    () => {
      if (antFetching || activeGuardiansFetching || totalRewardsFetching) {
        return [null, true]
      }

      const statsData = [antActiveBalance, activeGuardians, totalRewards]
      const statsError = [
        antActiveBalanceError,
        activeGuardiansError,
        totalRewardsError,
      ]
      return [
        COURT_STATS.map((stat, index) => {
          return {
            ...stat,
            value: statsData[index],
            error: statsError[index],
          }
        }),
        false,
      ]
    } /* eslint-disable react-hooks/exhaustive-deps */,
    [
      activeGuardians,
      activeGuardiansError,
      activeGuardiansFetching,
      antActiveBalance.toString(),
      antActiveBalanceError,
      antFetching,
      antFetching,
      totalRewards.toString(),
      totalRewardsError,
      totalRewardsFetching,
    ]
    /* eslint-disable-line react-hooks/exhaustive-deps */
  )
}

export default useCourtStats
