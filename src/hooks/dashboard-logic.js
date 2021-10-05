import { useCallback, useState } from 'react'

import { useANTBalances } from './useANT'
import { useSidePanel } from './useSidePanel'
import useGuardianRewards from './useGuardianRewards'
import useGuardianAppealCollaterals from './useGuardianAppealCollaterals'
import { useANTActions, useRewardActions } from './useCourtContracts'
import { useDashboardState } from '../components/Dashboard/DashboardStateProvider'

export const REQUEST_MODE = {
  ACTIVATE: Symbol('ACTIVATE'),
  DEACTIVATE: Symbol('DEACTIVATE'),
  STAKE_ACTIVATE: Symbol('STAKE_ACTIVATE'),
  WITHDRAW: Symbol('WITHDRAW'),
  UNLOCK_ACTIVATION: Symbol('UNLOCK_ACTIVATION'),
}

const stringMapping = {
  [REQUEST_MODE.ACTIVATE]: 'Activate',
  [REQUEST_MODE.STAKE_ACTIVATE]: 'Activate',
  [REQUEST_MODE.DEACTIVATE]: 'Deactivate',
  [REQUEST_MODE.WITHDRAW]: 'Withdraw',
  [REQUEST_MODE.UNLOCK_ACTIVATION]: 'Unlock',
}

export function getRequestModeString(mode) {
  return stringMapping[mode]
}

export function usePanelRequestMode(requestPanelOpen) {
  const [requestMode, setRequestMode] = useState(REQUEST_MODE.ACTIVATE)

  const updateMode = useCallback(
    newMode => {
      setRequestMode(newMode)
      requestPanelOpen()
    },
    [requestPanelOpen]
  )

  return [requestMode, updateMode]
}

// Requests to set new mode and open side panel
export function usePanelRequestActions(request) {
  // TODO: Should we implement only one request function to recieve the request mode ?
  const activateANT = useCallback(() => {
    request(REQUEST_MODE.ACTIVATE)
  }, [request])

  const deactivateANT = useCallback(() => {
    request(REQUEST_MODE.DEACTIVATE)
  }, [request])

  const stakeActivateANT = useCallback(() => {
    request(REQUEST_MODE.STAKE_ACTIVATE)
  }, [request])

  const unlockActivation = useCallback(() => {
    console.log("uhuuu ", )
    request(REQUEST_MODE.UNLOCK_ACTIVATION)
  }, [request])

  const withdrawANT = useCallback(() => {
    request(REQUEST_MODE.WITHDRAW)
  }, [request])

  return { activateANT, deactivateANT, unlockActivation, stakeActivateANT, withdrawANT }
}

export function useDashboardLogic() {
  const {
    activateANT,
    deactivateANT,
    stakeActivateANT,
    withdrawANT,
    unlockSettings,
    unlockActivation
  } = useANTActions()

  const rewards = useGuardianRewards()
  const antBalances = useANTBalances()
  const panelState = useSidePanel()

  const appealCollaterals = useGuardianAppealCollaterals()
  const {
    treasury,
    fetching: fetchingData,
    errors: errorsFetching,
  } = useDashboardState()

  const [mode, setMode] = usePanelRequestMode(panelState.requestOpen)
  const requests = usePanelRequestActions(setMode)

  const { claimRewards } = useRewardActions()
  const actions = {
    activateANT:
      mode === REQUEST_MODE.STAKE_ACTIVATE ? stakeActivateANT : activateANT,
    deactivateANT,
    withdrawANT,
    claimRewards,
    unlockActivation,
    unlockSettings, // boolean flag instead of a function
  }

  return {
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
  }
}
