import { getNetworkType, isLocalOrUnknownNetwork } from './lib/web3-utils'
import environment from './environment'

const SUBGRAPH_NAME = environment('SUBGRAPH_NAME')

export const RINKEBY_COURT = '0xC464EB732A1D2f5BbD705727576065C91B2E9f18'

// The staging below is rinkeby-staging. This means that we have another court deployed on rinkeby,
// but with easier settings so that we could test better from localhost. This is a little bit different
// from actual rinkeby, because on rinkeby, customers can also test, but on staging, it's only the
// developers that can test better with less term duration(10 minutes...), while on rinkeby, it's 2 hours
export const RINKEBY_STAGING_COURT = '0x9c003eC97676c30a041f128D671b3Db2f790c3E7'

export const networkConfigs = {
  main: {
    court: '0xFb072baA713B01cE944A0515c3e1e98170977dAF',
    network_agent: '0x5e8c17a6065c35b172b10e80493d2266e2947df4',
    network_reserve: '0xec0dd1579551964703246becfbf199c27cb84485',
    anjLockMinter: '0xAb788183FfAD7D3fAa54Cfc1f9EEf7ff981F4cfD',
    nodes: {
      defaultEth: 'https://mainnet.eth.aragon.network/',
      subgraph:
        `https://gateway-arbitrum.network.thegraph.com/api/${environment('SUBGRAPH_API_KEY')}/subgraphs/id/2U7z4qy1jxQ5b9aE7o2C41CJN4kSaAEfM876nk9Hu6wA`,
    },
  },
  rinkeby: {
    court: getRinkebyCourtAddress(SUBGRAPH_NAME),
    anjLockMinter: '0x8A3475C25452B280a3Af1A8a9B4440e9f70f2f30',
    nodes: {
      defaultEth: 'https://rinkeby.eth.aragon.network/',
      subgraph: getRinkebySubgraphUrls(SUBGRAPH_NAME)
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


function getRinkebyCourtAddress(subgraphName) {
  if (subgraphName === 'staging') {
    return RINKEBY_STAGING_COURT
  }
  return RINKEBY_COURT
}

function getRinkebySubgraphUrls(subgraphName) {
  return `https://api.thegraph.com/subgraphs/name/aragon/aragon-court-v2-${subgraphName ||
    'rinkeby'}`
}