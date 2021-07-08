import { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { useCourtConfig } from '../providers/CourtConfig'
import {
  useCourtSubscriptionActions,
  useHNYBalanceOfPolling,
} from './useCourtContracts'
import { useDashboardState } from '../components/Dashboard/DashboardStateProvider'

import { hasJurorClaimed } from '../utils/subscription-utils'

export default function useJurorSubscriptionFees() {
  const wallet = useWallet()
  const { subscriptionModule } = useCourtConfig()
  const { getters } = useCourtSubscriptionActions()
  const { claimedSubscriptionFees } = useDashboardState()

  const [subscriptionFees, setSubscriptionFees] = useState([])

  // subscriptionModule.periods contains the latest period
  // Jurors failing to claim for a period, will forfeit the unclaimed amount
  // The unclaimed amount won't accrue for the juror and instead will be available for distribution for all jurors in the next period
  // For this reason we should only check if the juror has unclaimed amount for the latest period
  const periods = subscriptionModule?.periods || []

  const availableBalance = useHNYBalanceOfPolling(subscriptionModule.id)

  useEffect(() => {
    let cancelled = false

    const fetchSubscriptionFees = async () => {
      if (periods.length < 1 || !getters || !claimedSubscriptionFees) {
        return
      }

      // getJurorShare could fail if the termRandomness cannot yet be computed for the designated term (meaning that the current block is not yet > the block at which the court was heartbeated + 1)
      try {
        const jurorSubscriptionsFees = []
        const period = periods[0] // Remember as noted before, periods only contains the latest period
        const periodId = period.id

        // jurorShare is conformed by [address: token, BigNum: shareAmount]
        const jurorShare = await getters.getJurorShare(wallet.account)
        if (
          jurorShare[1].gt(0) &&
          !hasJurorClaimed(claimedSubscriptionFees, periodId) &&
          jurorShare.lte(availableBalance)
        ) {
          jurorSubscriptionsFees.push({
            periodId,
            amount: jurorShare[1],
          })
        }

        if (!cancelled) {
          setSubscriptionFees(jurorSubscriptionsFees)
        }
      } catch (err) {
        console.error(`Error fetching keeper subscription fees: ${err.message}`)
        if (!cancelled) {
          setSubscriptionFees([])
        }
      }
    }

    fetchSubscriptionFees()

    return () => {
      cancelled = true
    }
  }, [
    availableBalance,
    claimedSubscriptionFees,
    getters,
    periods,
    wallet.account,
  ])

  return subscriptionFees
}
