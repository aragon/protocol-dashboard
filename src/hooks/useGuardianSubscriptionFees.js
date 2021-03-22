import { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { useCourtConfig } from '../providers/CourtConfig'
import { useCourtSubscriptionActions } from './useCourtContracts'
import { useDashboardState } from '../components/Dashboard/DashboardStateProvider'

import { hasGuardianClaimed } from '../utils/subscription-utils'

export default function useGuardianSubscriptionFees() {
  const wallet = useWallet()
  const { subscriptionModule } = useCourtConfig()
  const { getters } = useCourtSubscriptionActions()
  const { claimedSubscriptionFees } = useDashboardState()

  const [subscriptionFees, setSubscriptionFees] = useState([])

  const periods = subscriptionModule?.periods || []

  useEffect(() => {
    let cancelled = false

    const fetchSubscriptionFees = async () => {
      if (periods.length === 0 || !getters || !claimedSubscriptionFees) {
        return
      }

      try {
        const guardianSubscriptionsFees = []
        // Subscription fees can be only claimed for past periods
        for (let index = 0; index < periods.length - 1; index++) {
          if (cancelled) {
            break
          }

          const period = periods[index]
          if (period.collectedFees.gt(0)) {
            const periodId = period.id

            // TODO: See if we can get the guardian share directly from the period data
            const guardianShare = await getters.getGuardianShare(
              wallet.account,
              periodId
            )

            // guardianShare is conformed by [address: token, BigNum: shareAmount]
            if (
              guardianShare[1].gt(0) &&
              !hasGuardianClaimed(claimedSubscriptionFees, periodId)
            ) {
              guardianSubscriptionsFees.push({
                periodId,
                amount: guardianShare[1],
              })
            }
          }
        }

        if (!cancelled) {
          setSubscriptionFees(guardianSubscriptionsFees)
        }
      } catch (err) {
        console.error(`Error fetching guardian subscription fees: ${err}`)
      }
    }

    fetchSubscriptionFees()

    return () => {
      cancelled = true
    }
  }, [claimedSubscriptionFees, getters, periods, wallet.account])

  return subscriptionFees
}
