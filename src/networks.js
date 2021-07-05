import environment from './environment'
import { getNetworkType, isLocalOrUnknownNetwork } from './lib/web3-utils'

const SUBGRAPH_NAME = environment('SUBGRAPH_NAME')

export const RINKEBY_COURT = '0x35e7433141D5f7f2EB7081186f5284dCDD2ccacE'
export const RINKEBY_STAGING_COURT =
  '0x52180Af656A1923024D1ACcF1D827AB85cE48878'

// TODO: Add type and name
export const networkConfigs = {
  xdai: {
    court: '0x44E4fCFed14E1285c9e0F6eae77D5fDd0F196f85',
    explorer: 'blockscout',
    nodes: {
      defaultEth: 'https://xdai.poanetwork.dev/',
      subgraph: 'https://api.thegraph.com/subgraphs/name/1hive/celeste',
    },
  },
  rinkeby: {
    court: getRinkebyCourtAddress(SUBGRAPH_NAME),
    explorer: 'etherscan',
    nodes: {
      subgraph: getRinkebySubgraphUrls(SUBGRAPH_NAME),
    },
  },
  local: {
    court: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
    nodes: {
      defaultEth: 'http://localhost:8545',
      subgraph: 'http://127.0.0.1:8000/subgraphs/name/1hive/celeste-rpc',
    },
  },
}

export function getInternalNetworkName() {
  return isLocalOrUnknownNetwork() ? 'local' : getNetworkType()
}

export function getNetworkConfig() {
  return networkConfigs[getInternalNetworkName()]
}

export const networkAgentAddress = getNetworkConfig().network_agent

export const networkReserveAddress = getNetworkConfig().network_reserve

function getRinkebyCourtAddress(subgraphName) {
  if (subgraphName === 'staging') {
    return RINKEBY_STAGING_COURT
  }
  return RINKEBY_COURT
}

function getRinkebySubgraphUrls(subgraphName) {
  return `https://api.thegraph.com/subgraphs/name/1hive/celeste-${subgraphName ||
    'rinkeby'}`
}
