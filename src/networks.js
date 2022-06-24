import environment from './environment'
import { getPreferredChain } from './local-settings'
import {
  getNetworkName,
  getNetworkType,
  isLocalOrUnknownNetwork,
} from './lib/web3-utils'

const SUBGRAPH_NAME = environment('SUBGRAPH_NAME')

export const RINKEBY_COURT = '0xC2224D785D4e4bc92D5be6767A82d026ca2813fD'
export const RINKEBY_STAGING_COURT =
  '0x52180Af656A1923024D1ACcF1D827AB85cE48878'

export const SUPPORTED_CHAINS = [4, 100, 137]
const XDAI_ETH_NODE = environment('XDAI_ETH_NODE')
const POLYGON_ETH_NODE = environment('POLYGON_ETH_NODE')

// TODO: Add type and name
export const networkConfigs = {
  xdai: {
    court: '0x44E4fCFed14E1285c9e0F6eae77D5fDd0F196f85',
    explorer: 'blockscout',
    name: 'xDai',
    type: 'xdai',
    chainId: 100,
    nodes: {
      defaultEth: XDAI_ETH_NODE,
      subgraph: 'https://api.thegraph.com/subgraphs/name/1hive/celeste',
    },
    eip3085: {
      chainId: '0x64',
      chainName: 'xDai',
      rpcUrls: ['https://rpc.gnosischain.com/'],
      iconUrls: [
        'https://gblobscdn.gitbook.com/spaces%2F-Lpi9AHj62wscNlQjI-l%2Favatar.png',
      ],
      nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
      blockExplorerUrls: ['https://blockscout.com/poa/xdai/'],
    },
  },
  rinkeby: {
    court: getRinkebyCourtAddress(SUBGRAPH_NAME),
    explorer: 'etherscan',
    name: 'Rinkeby',
    nodes: {
      subgraph: getRinkebySubgraphUrls(SUBGRAPH_NAME),
    },
  },
  polygon: {
    court: '0xf0C8376065fadfACB706caFbaaC96B321069C015',
    explorer: 'polygonscan',
    name: 'Polygon',
    type: 'polygon',
    chainId: 137,
    nodes: {
      defaultEth: POLYGON_ETH_NODE,
      subgraph: 'https://api.thegraph.com/subgraphs/name/1hive/celeste-polygon',
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

export function getInternalNetworkName(chainId = getPreferredChain()) {
  return isLocalOrUnknownNetwork(chainId) ? 'local' : getNetworkType(chainId)
}

export function getNetworkConfig(chainId = getPreferredChain()) {
  return networkConfigs[getInternalNetworkName(chainId)]
}

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

export const addEthereumChain = () => {
  const { eip3085 } = getNetworkConfig()
  if (!eip3085) {
    return Promise.resolve(null) // Network is not custom
  }
  return window?.ethereum?.request({
    method: 'wallet_addEthereumChain',
    params: [eip3085],
  })
}

export const switchNetwork = async chainId => {
  const chainIdHex = `0x${chainId.toString(16)}`
  try {
    await window?.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to Injected provider.
    if (switchError.code === 4902) {
      await addEthereumChain()
    }
    console.error(switchError)
  }
}

export function isSupportedChain(chainId) {
  return SUPPORTED_CHAINS.includes(chainId)
}

export function getSupportedChainsNamesFormatted() {
  let networkNames = ''
  SUPPORTED_CHAINS.forEach((chain, i, array) => {
    networkNames += getNetworkName(chain)
    if (i !== array.length - 1) {
      networkNames += ', '
    }
  })
  return networkNames
}

export function getEthersNetwork(chainId) {
  const { type, ensRegistry } = getNetworkConfig(chainId)
  return {
    name: type,
    chainId: chainId,
    ensAddress: ensRegistry,
  }
}
