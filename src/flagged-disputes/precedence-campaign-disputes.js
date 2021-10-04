import {
  networkConfigs,
  getNetworkConfig,
  getInternalNetworkName,
} from '../networks'

const PRECEDENCE_CAMPAIGN_DISPUTES = {
  main: new Map([[networkConfigs.main.court, new Map([])]]),
  rinkeby: new Map([[networkConfigs.rinkeby.court, new Map([])]]),
  ropsten: new Map([[networkConfigs.ropsten.court, new Map([])]]),
  local: new Map([[networkConfigs.local.court, new Map([])]]),
}

export function getPrecedenceCampaignDisputesByCourt() {
  const courtAddress = getNetworkConfig().court

  return PRECEDENCE_CAMPAIGN_DISPUTES[getInternalNetworkName()].get(
    courtAddress
  )
}
