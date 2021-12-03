import environment from './environment'

import { isLocalOrUnknownNetwork, getNetworkType } from './lib/web3-utils'
import { getNetworkConfig } from './networks'
import { getIpfsGateway } from './local-settings'

const COURT_SERVER_NAME = environment('COURT_SERVER_NAME')

// BrightId endpoints
export const BRIGHT_ID_ENDPOINT_V5 = 'https://app.brightid.org/node/v5'
export const BRIGHTID_VERIFICATION_ENDPOINT = `${BRIGHT_ID_ENDPOINT_V5}/verifications`
export const BRIGHTID_1HIVE_INFO_ENDPOINT = `${BRIGHT_ID_ENDPOINT_V5}/apps/1hive`
export const BRIGHTID_SUBSCRIPTION_ENDPOINT = `${BRIGHT_ID_ENDPOINT_V5}/operations`

export const WALLET_CONNECT_BRIDGE_ENDPOINT =
  'https://walletconnect-relay.minerva.digital'

// Court server endpoint
export function courtServerEndpoint() {
  if (isLocalOrUnknownNetwork()) {
    return 'http://127.0.0.1:8050'
  }

  const networkType = getNetworkType()
  return `https://celeste-server${
    networkType === 'xdai' ? '' : `-${COURT_SERVER_NAME || networkType}`
  }.1hive.org`
}

export function graphEndpoint() {
  const { nodes } = getNetworkConfig()
  return nodes.subgraph
}

export const defaultIpfsEndpoint = () => {
  return isLocalOrUnknownNetwork()
    ? 'http://127.0.0.1:8080/ipfs'
    : 'https://ipfs.io/ipfs/'
}
export const defaultIpfsGateway = () => getIpfsGateway()
