import {
  networkConfigs,
  getInternalNetworkName,
  getNetworkConfig
} from '../networks'
import env from '../environment'

const VOIDED_DISPUTES = {
  main: new Map([[networkConfigs.main.court, new Map([])]]),
  rinkeby: new Map([[networkConfigs.rinkeby.court, new Map([])]]),
  ropsten: new Map([[networkConfigs.ropsten.court, new Map([])]]),
  local: new Map([[networkConfigs.local.court, new Map([])]]),
}

export function getVoidedDisputesByCourt() {
  if (env('SKIP_VOIDING')) {
    return new Map([])
  }
  const courtAddress = getNetworkConfig().court

  return VOIDED_DISPUTES[getInternalNetworkName()].get(courtAddress)
}
