import environment from './environment'
import { getPreferredChain } from './local-settings'
import {
  getNetworkName,
  getNetworkType,
  isLocalOrUnknownNetwork,
} from './lib/web3-utils'

const SUBGRAPH_NAME = environment('SUBGRAPH_NAME')

export const RINKEBY_COURT = '0x35e7433141D5f7f2EB7081186f5284dCDD2ccacE'
export const RINKEBY_STAGING_COURT =
  '0x52180Af656A1923024D1ACcF1D827AB85cE48878'

export const SUPPORTED_CHAINS = [100, 137]

// TODO: Add type and name
export const networkConfigs = {
  xdai: {
    court: '0x44E4fCFed14E1285c9e0F6eae77D5fDd0F196f85',
    explorer: 'blockscout',
    name: 'xDai',
    type: 'xdai',
    chainId: 100,
    nodes: {
      defaultEth: 'https://xdai.poanetwork.dev/',
      subgraph: 'https://api.thegraph.com/subgraphs/name/1hive/celeste',
    },
    eip3085: {
      chainId: '0x64',
      chainName: 'xDai',
      rpcUrls: ['https://rpc.xdaichain.com/'],
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
    court: '0x0ED8867EDaBD4d0b5045E45a39077D97a6B78cbE',
    explorer: 'polygonscan',
    name: 'Polygon',
    type: 'polygon',
    chainId: 137,
    nodes: {
      defaultEth: 'https://polygon-rpc.com/',
      subgraph: 'https://api.thegraph.com/subgraphs/name/1hive/celeste-matic',
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
  console.log('preferred ', getPreferredChain())
  console.log('thisssss ', networkConfigs[getInternalNetworkName(chainId)])
  return networkConfigs[getInternalNetworkName(chainId)]
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

export function getEthersNetwork() {
  const { type, chainId, ensRegistry } = getNetworkConfig()
  console.log('network1 ', type, chainId, ensRegistry)
  return {
    name: type,
    chainId: chainId,
    ensAddress: ensRegistry,
  }
}
