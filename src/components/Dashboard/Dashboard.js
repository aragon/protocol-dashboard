import React from 'react'
import { GU, SidePanel, Split, useLayout } from '@aragon/ui'

import Welcome from './Welcome'
import Tasks from '../Tasks/Tasks'
import TitleHeader from '../TitleHeader'
import ErrorLoading from '../Errors/ErrorLoading'
import BalanceModule from './BalanceModule'
import RewardsModule from './RewardsModule'
import ActivateANT from './panels/ActivateANT'
import WithdrawANT from './panels/WithdrawANT'
import DeactivateANT from './panels/DeactivateANT'
import UnlockActivation from './panels/UnlockActivation'
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
    antBalances,
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
              balances={antBalances}
              loading={fetchingData}
              unlockSettings={actions.unlockSettings}
              onRequestUnlockActivation={requests.unlockActivation}
              onRequestActivate={requests.activateANT}
              onRequestDeactivate={requests.deactivateANT}
              onRequestStakeActivate={requests.stakeActivateANT}
              onRequestWithdraw={requests.withdrawANT}
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
        title={`${getRequestModeString(mode)} ANT`}
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
          balances={antBalances}
          onDone={panelState.requestClose}
        />
      </SidePanel>
    </React.Fragment>
  )
}

function PanelComponent({ mode, actions, balances, ...props }) {
  const { activateANT, deactivateANT, withdrawANT, unlockActivation } = actions
  const { walletBalance, activeBalance } = balances

  const unlockedActiveBalance = getTotalUnlockedActiveBalance(balances)
  const effectiveInactiveBalance = getTotalEffectiveInactiveBalance(balances)
  switch (mode) {
    case REQUEST_MODE.DEACTIVATE:
      return (
        <DeactivateANT
          activeBalance={unlockedActiveBalance}
          onDeactivateANT={deactivateANT}
          {...props}
        />
      )
    case REQUEST_MODE.UNLOCK_ACTIVATION:
      return (
        <UnlockActivation
          lockedBalance={actions.unlockSettings.lockedAmount}
          onUnlockActivation={unlockActivation}
          {...props}
        />
      )
    case REQUEST_MODE.WITHDRAW:
      return (
        <WithdrawANT
          inactiveBalance={effectiveInactiveBalance}
          onWithdrawANT={withdrawANT}
          {...props}
        />
      )
    default:
      return (
        <ActivateANT
          activeBalance={activeBalance.amount}
          inactiveBalance={effectiveInactiveBalance}
          walletBalance={walletBalance.amount}
          onActivateANT={activateANT}
          label={mode === REQUEST_MODE.STAKE_ACTIVATE ? 'Approve, Stake and Activate' : 'Activate'}
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

