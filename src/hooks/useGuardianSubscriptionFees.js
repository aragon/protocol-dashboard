import { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { useCourtConfig } from '../providers/CourtConfig'
import { useCourtSubscriptionActions } from './useCourtContracts'
import { useDashboardState } from '../components/Dashboard/DashboardStateProvider'

import { hasGuardianClaimed } from '../utils/subscription-utils'

/*

Below code tries to calculate subscription fees. The idea is that subscriptions was changed to PaymentsBook on the court itself.
This means that `subscriptions` doesn't exist on the court's graphql anymore and should be changed to paymentsBook.
paymentsBook has a little bit different logic which means the below calculation in the useGuardianSubscriptionFees
needs to change a little bit to reflect the payments book changes. since subscriptionModule.periods below always returns []
due to the fact that subscriptions doesn't exist anymore on the graphql, We are safe to leave it even without being commented.
But as a todo task, this will need to be changed to reflect payments book logic or completelly removed.

*/
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
