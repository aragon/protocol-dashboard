import { getNetworkType, isLocalOrUnknownNetwork } from './lib/web3-utils'

export const networkConfigs = {
  main: {
    court: '0xee4650cBe7a2B23701D416f58b41D8B76b617797',
    network_agent: '0x5e8c17a6065c35b172b10e80493d2266e2947df4',
    network_reserve: '0xec0dd1579551964703246becfbf199c27cb84485',
    nodes: {
      defaultEth: 'https://mainnet.eth.aragon.network/',
      subgraph:
        'https://graph.backend.aragon.org/subgraphs/name/aragon/aragon-court',
    },
  },
  rinkeby: {
    court: '0xF8Bf76753F4bb6AEBc06d64e1C5AAaEc0EAcDCfA',
    nodes: {
      defaultEth: 'https://rinkeby.eth.aragon.network/',
      subgraph: 
        'https://api.thegraph.com/subgraphs/name/aragon/aragon-court-v2-rinkeby'
    },
  },
  ropsten: {
    court: '0x3b26bc496aebaed5b3E0E81cDE6B582CDe71396e',
    nodes: {
      defaultEth: 'https://ropsten.eth.aragon.network/',
      subgraph:
        'https://api.thegraph.com/subgraphs/name/aragon/aragon-court-ropsten',
    },
  },
  local: {
    court: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
    nodes: {
      defaultEth: 'http://localhost:8545',
      subgraph: 'http://127.0.0.1:8000/subgraphs/name/aragon/aragon-court-rpc',
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

