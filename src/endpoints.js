import environment from './environment'

import { isLocalOrUnknownNetwork, getNetworkType } from './lib/web3-utils'
import { getNetworkConfig } from './networks'
import {
  getDefaultEthNode,
  getIpfsGateway,
  getSubgraphHttpEndpoint,
} from './local-settings'

const CHAIN_ID = environment('CHAIN_ID')
const networkType = getNetworkType(CHAIN_ID)
const SUBGRAPH_NAME = environment('SUBGRAPH_NAME')

const RINKEBY_STAGING_SERVER_URL = 'https://court-rinkeby-staging-backend.aragon.org';
const RINKEBY_SERVER_URL = 'https://court-rinkeby-backend.aragon.org';
const ROPSTEN_SERVER_URL = null
const MAINNET_SERVER_URL = 'https://court-backend.aragon.org';

// IPFS endpoint
export const IPFS_ENDPOINT = isLocalOrUnknownNetwork(CHAIN_ID)
  ? 'http://127.0.0.1:8080/ipfs'
  : 'https://ipfs.eth.aragon.network/ipfs'

// Court server endpoint
export function courtServerEndpoint() {
  if (isLocalOrUnknownNetwork(CHAIN_ID)) {
    return 'http://127.0.0.1:8050'
  }

  if(networkType === 'main') return MAINNET_SERVER_URL
  if(SUBGRAPH_NAME === 'staging') return RINKEBY_STAGING_SERVER_URL
  if(networkType === 'rinkeby') return RINKEBY_SERVER_URL
  if(networkType === 'ropsten') return ROPSTEN_SERVER_URL

  return null
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


