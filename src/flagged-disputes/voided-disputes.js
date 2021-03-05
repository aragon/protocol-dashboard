import {
  networkConfigs,
  getInternalNetworkName,
  getNetworkConfig,
  RINKEBY_COURT,
  RINKEBY_STAGING_COURT,
} from '../networks'
import env from '../environment'

const VOIDED_DISPUTES = {
  xdai: new Map([[networkConfigs.xdai.court, new Map([])]]),
  rinkeby: new Map([
    [RINKEBY_COURT, new Map([])],
    [RINKEBY_STAGING_COURT, new Map([])],
  ]),
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
