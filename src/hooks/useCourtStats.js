import { useMemo } from 'react'
import { useActiveJurorsNumber } from '../hooks/query-hooks'
import {
  useJurorRegistrySubscription,
  useTotalRewardsSubscription,
} from '../hooks/subscription-hooks'
import { getKnownToken } from '../utils/known-tokens'
import { bigNum } from '../lib/math-utils'
import IconHNY from '../assets/IconHNY.svg'

const COURT_STATS = [
  {
    label: 'Total Active HNY',
    token: { ...getKnownToken('HNY'), icon: IconHNY },
  },
  { label: 'Total Active Keepers' },
  {
    label: 'Total Rewards HNY',
    token: { ...getKnownToken('HNY'), icon: IconHNY },
  },
]

export function useTotalActiveBalance() {
  const { data: jurorRegistryStats, error } = useJurorRegistrySubscription()

  return useMemo(() => {
    if (!jurorRegistryStats || error) {
      return [bigNum(-1), error]
    }
    return [bigNum(jurorRegistryStats.totalActive), error]
  }, [error, jurorRegistryStats])
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
 * Hook to get the dashboard stats HNY active balance, ANT total stake and the active jurors number
 * @returns {Array} First item an array with the stats and the second one a loading state
 */
function useCourtStats() {
  const [anjActiveBalance, anjActiveBalanceError] = useTotalActiveBalance()
  const [activeJurors, activeJurorsError] = useActiveJurorsNumber()
  const [totalRewards, totalRewardsError] = useTotalRewards()

  // Loading states
  const anjFetching = anjActiveBalance.eq(bigNum(-1)) && !anjActiveBalanceError
  const activeJurorsFetching = activeJurors === null && !activeJurorsError
  const totalRewardsFetching = totalRewards.eq(bigNum(-1)) && !totalRewardsError

  return useMemo(
    () => {
      if (anjFetching || activeJurorsFetching || totalRewardsFetching) {
        return [null, true]
      }

      const statsData = [anjActiveBalance, activeJurors, totalRewards]
      const statsError = [
        anjActiveBalanceError,
        activeJurorsError,
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
      activeJurors,
      activeJurorsError,
      activeJurorsFetching,
      anjActiveBalance.toString(),
      anjActiveBalanceError,
      anjFetching,
      totalRewards.toString(),
      totalRewardsError,
      totalRewardsFetching,
    ]
    /* eslint-disable-line react-hooks/exhaustive-deps */
  )
}

export default useCourtStats
