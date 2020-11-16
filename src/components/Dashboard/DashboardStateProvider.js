import React, { useContext } from 'react'
import { useWallet } from '../../providers/Wallet'
import {
  useAppealsByUserSubscription,
  useJurorBalancesSubscription,
  useJurorDraftsRewardsSubscription,
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
        antMovements: [],
        antBalances: {},
        appeals: [],
        claimedSubscriptionFees: [],
        jurorDrafts: [],
        treasury: [],
      }}
    >
      {children}
    </Provider>
  )
}

function WithSubscription({ Provider, connectedAccount, children }) {
  // Juror ANT balances, 24h ANT movements and claimed subscription fees
  const {
    antBalances,
    antMovements,
    claimedSubscriptionFees,
    treasury,
    fetching: balancesFetching,
    errors: balanceErrors,
  } = useJurorBalancesSubscription(connectedAccount)

  // Appeals
  const {
    appeals,
    fetching: appealsFetching,
    errors: appealErrors,
  } = useAppealsByUserSubscription(connectedAccount, false) // Non settled appeals

  // Juror drafts not rewarded
  const {
    jurorDrafts,
    fetching: jurorDraftsFetching,
    error: jurorDraftsError,
  } = useJurorDraftsRewardsSubscription(connectedAccount)

  const fetching = balancesFetching || appealsFetching || jurorDraftsFetching
  const errors = [
    ...balanceErrors,
    ...appealErrors,
    ...(jurorDraftsError ? [jurorDraftsError] : []),
  ]

  return (
    <Provider
      value={{
        antBalances,
        antMovements,
        appeals,
        claimedSubscriptionFees,
        errors,
        fetching,
        jurorDrafts,
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
