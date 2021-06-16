import environment from './environment'

import { isLocalOrUnknownNetwork, getNetworkType } from './lib/web3-utils'
import { getNetworkConfig } from './networks'
import {
  getDefaultEthNode,
  getIpfsGateway,
  getSubgraphHttpEndpoint,
} from './local-settings'

const CHAIN_ID = environment('CHAIN_ID')
const COURT_SERVER_NAME = environment('COURT_SERVER_NAME')
const networkType = getNetworkType(CHAIN_ID)

// IPFS endpoint
export const IPFS_ENDPOINT = isLocalOrUnknownNetwork(CHAIN_ID)
  ? 'http://127.0.0.1:8080/ipfs'
  : 'https://ipfs.io/ipfs'

// Court server endpoint
export function courtServerEndpoint() {
  if (isLocalOrUnknownNetwork(CHAIN_ID)) {
    return 'http://127.0.0.1:8050'
  }

  return `https://court${
    networkType === 'main' ? '' : `-${COURT_SERVER_NAME || networkType}`
  }-backend.aragon.org`
}

export function graphEndpoint() {
  const { nodes } = getNetworkConfig()
  return nodes.subgraph
}

export const defaultEthNode =
  getDefaultEthNode() || getNetworkConfig().nodes.defaultEth

export const defaultIpfsGateway = getIpfsGateway()

export const defaultSubgraphHttpEndpoint = getSubgraphHttpEndpoint()

export const V1_COURT_ENDPOINT = isLocalOrUnknownNetwork(CHAIN_ID)
  ? 'https://court.aragon.org'
  : `https://v1.${
    networkType === 'main' ? '' : `${networkType}.`
  }court.aragon.org`


