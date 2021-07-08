import React from 'react'
import { GU, SidePanel, Split, useLayout } from '@1hive/1hive-ui'

import Welcome from './Welcome'
import Tasks from '../Tasks/Tasks'
import TitleHeader from '../TitleHeader'
import ErrorLoading from '../Errors/ErrorLoading'
import BalanceModule from './BalanceModule'
import RewardsModule from './RewardsModule'
import ActivateHNY from './panels/ActivateHNY'
import WithdrawHNY from './panels/WithdrawHNY'
import DeactivateHNY from './panels/DeactivateHNY'
import AppealColateralModule from './AppealColateralModule'
import CourtStats from './CourtStats'

import { useWallet } from '../../providers/Wallet'
import { DashboardStateProvider } from './DashboardStateProvider'
import {
  getRequestModeString,
  useDashboardLogic,
  REQUEST_MODE,
} from '../../hooks/dashboard-logic'
import {
  getTotalUnlockedActiveBalance,
  getTotalEffectiveInactiveBalance,
} from '../../utils/balance-utils'

function Dashboard() {
  const wallet = useWallet()
  const {
    actions,
    anjBalances,
    appealCollaterals,
    errorsFetching,
    fetchingData,
    mode,
    panelState,
    requests,
    rewards,
    treasury,
  } = useDashboardLogic()

  const { name: layout } = useLayout()
  const oneColumn = layout === 'small' || layout === 'medium'

  return (
    <React.Fragment>
      <TitleHeader title="Dashboard" onlyTitle={!wallet.account} />
      {errorsFetching?.length > 0 ? (
        <ErrorLoading
          subject="dashboard"
          errors={errorsFetching.map(error => error.message)}
        />
      ) : (
        <>
          {wallet.account ? (
            <BalanceModule
              balances={anjBalances}
              loading={fetchingData}
              onRequestActivate={requests.activateHNY}
              onRequestDeactivate={requests.deactivateHNY}
              onRequestStakeActivate={requests.stakeActivateHNY}
              onRequestWithdraw={requests.withdrawHNY}
            />
          ) : (
            <Welcome />
          )}

          {!wallet.account ? (
            <Split
              primary={<Tasks onlyTable />}
              secondary={<CourtStats />}
              invert="horizontal"
            />
          ) : (
            <Split
              primary={<Tasks onlyTable />}
              secondary={
                <>
                  <RewardsModule
                    rewards={rewards}
                    treasury={treasury}
                    loading={fetchingData}
                    onClaimRewards={actions.claimRewards}
                  />
                  <AppealColateralModule
                    appeals={appealCollaterals}
                    loading={fetchingData}
                  />
                </>
              }
              invert={oneColumn ? 'vertical' : 'horizontal'}
            />
          )}
        </>
      )}
      <SidePanel
        title={`${getRequestModeString(mode)} HNY`}
        opened={panelState.visible}
        onClose={panelState.requestClose}
        onTransitionEnd={panelState.endTransition}
      >
        <div
          css={`
            margin-top: ${2 * GU}px;
          `}
        />
        <PanelComponent
          mode={mode}
          actions={actions}
          balances={anjBalances}
          onDone={panelState.requestClose}
        />
      </SidePanel>
    </React.Fragment>
  )
}

function PanelComponent({ mode, actions, balances, ...props }) {
  const { activateHNY, deactivateHNY, withdrawHNY } = actions
  const { walletBalance, activeBalance } = balances

  const unlockedActiveBalance = getTotalUnlockedActiveBalance(balances)
  const effectiveInactiveBalance = getTotalEffectiveInactiveBalance(balances)

  switch (mode) {
    case REQUEST_MODE.DEACTIVATE:
      return (
        <DeactivateHNY
          activeBalance={unlockedActiveBalance}
          onDeactivateHNY={deactivateHNY}
          {...props}
        />
      )
    case REQUEST_MODE.WITHDRAW:
      return (
        <WithdrawHNY
          inactiveBalance={effectiveInactiveBalance}
          onWithdrawHNY={withdrawHNY}
          {...props}
        />
      )
    default:
      return (
        <ActivateHNY
          activeBalance={activeBalance.amount}
          inactiveBalance={effectiveInactiveBalance}
          walletBalance={walletBalance.amount}
          onActivateHNY={activateHNY}
          fromWallet={mode === REQUEST_MODE.STAKE_ACTIVATE}
          {...props}
        />
      )
  }
}

export default function DashboardWithSubscritpion(props) {
  return (
    <DashboardStateProvider>
      <Dashboard {...props} />
    </DashboardStateProvider>
  )
}
