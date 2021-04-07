import React, { useContext } from 'react'
import { useWallet } from '../../providers/Wallet'
import {
  useAppealsByUserSubscription,
  useGuardianBalancesSubscription,
  useGuardianDraftsRewardsSubscription,
} from '../../hooks/subscription-hooks'

const DashboardContext = React.createContext()

function DashboardStateProvider({ children }) {
  const wallet = useWallet()

  const Provider = DashboardContext.Provider

  // Workaround to not subscribe when no connected account
  if (wallet.account)
    return (
      <WithSubscription Provider={Provider} connectedAccount={wallet.account}>
        {children}
      </WithSubscription>
    )

  return (
    <Provider
      value={{
        stakingMovements: [],
        antBalances: {},
        appeals: [],
        claimedSubscriptionFees: [],
        guardianDrafts: [],
        treasury: [],
      }}
    >
      {children}
    </Provider>
  )
}

function WithSubscription({ Provider, connectedAccount, children }) {
  // Guardian ANT balances, 24h ANT movements and claimed subscription fees
  const {
    antBalances,
    stakingMovements,
    claimedSubscriptionFees,
    treasury,
    fetching: balancesFetching,
    errors: balanceErrors,
  } =  useGuardianBalancesSubscription(connectedAccount)

  // Appeals
  const {
    appeals,
    fetching: appealsFetching,
    errors: appealErrors,
  } = useAppealsByUserSubscription(connectedAccount, false) // Non settled appeals

  // Guardian drafts not rewarded
  const {
    guardianDrafts,
    fetching: guardianDraftsFetching,
    error: guardianDraftsError,
  } = useGuardianDraftsRewardsSubscription(connectedAccount)

  const fetching = balancesFetching || appealsFetching || guardianDraftsFetching
  const errors = [
    ...balanceErrors,
    ...appealErrors,
    ...(guardianDraftsError ? [guardianDraftsError] : []),
  ]

  return (
    <Provider
      value={{
        antBalances,
        stakingMovements,
        appeals,
        claimedSubscriptionFees,
        errors,
        fetching,
        guardianDrafts,
        treasury,
      }}
    >
      {children}
    </Provider>
  )
}

function useDashboardState() {
  return useContext(DashboardContext)
}

export { DashboardStateProvider, useDashboardState }
