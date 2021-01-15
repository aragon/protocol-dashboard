import { useCallback, useState } from 'react'

import { useHNYBalances } from './useHNY'
import { useSidePanel } from './useSidePanel'
import useJurorRewards from './useJurorRewards'
import useJurorAppealCollaterals from './useJurorAppealCollaterals'
import { useHNYActions, useRewardActions } from './useCourtContracts'
import { useDashboardState } from '../components/Dashboard/DashboardStateProvider'

export const REQUEST_MODE = {
  ACTIVATE: Symbol('ACTIVATE'),
  DEACTIVATE: Symbol('DEACTIVATE'),
  STAKE_ACTIVATE: Symbol('STAKE_ACTIVATE'),
  WITHDRAW: Symbol('WITHDRAW'),
}

const stringMapping = {
  [REQUEST_MODE.ACTIVATE]: 'Activate',
  [REQUEST_MODE.STAKE_ACTIVATE]: 'Activate',
  [REQUEST_MODE.DEACTIVATE]: 'Deactivate',
  [REQUEST_MODE.WITHDRAW]: 'Withdraw',
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
  const activateHNY = useCallback(() => {
    request(REQUEST_MODE.ACTIVATE)
  }, [request])

  const deactivateHNY = useCallback(() => {
    request(REQUEST_MODE.DEACTIVATE)
  }, [request])

  const stakeActivateHNY = useCallback(() => {
    request(REQUEST_MODE.STAKE_ACTIVATE)
  }, [request])

  const withdrawHNY = useCallback(() => {
    request(REQUEST_MODE.WITHDRAW)
  }, [request])

  return { activateHNY, deactivateHNY, stakeActivateHNY, withdrawHNY }
}

export function useDashboardLogic() {
  const {
    activateHNY,
    deactivateHNY,
    stakeActivateHNY,
    withdrawHNY,
  } = useHNYActions()

  const rewards = useJurorRewards()
  const anjBalances = useHNYBalances()
  const panelState = useSidePanel()

  const appealCollaterals = useJurorAppealCollaterals()
  const {
    treasury,
    fetching: fetchingData,
    errors: errorsFetching,
  } = useDashboardState()

  const [mode, setMode] = usePanelRequestMode(panelState.requestOpen)
  const requests = usePanelRequestActions(setMode)

  const { claimRewards } = useRewardActions()
  const actions = {
    activateHNY:
      mode === REQUEST_MODE.STAKE_ACTIVATE ? stakeActivateHNY : activateHNY,
    deactivateHNY,
    withdrawHNY,
    claimRewards,
  }

  return {
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
  }
}
