import env from './environment'
import { IPFS_ENDPOINT } from './endpoints'
// import { getNetworkConfig } from './networks'

const CLIENT_THEME = 'THEME'
const DEFAULT_CHAIN_ID = 100
const DEFAULT_ETH_NODE = 'DEFAULT_ETH_NODE'
// const DEFAULT_SUBGRAPH_HTTP_ENDPOINT = getNetworkConfig().node.subgraph
const IPFS_GATEWAY = 'IPFS_GATEWAY'
const PACKAGE_VERSION = 'PACKAGE_VERSION'
const PREFERRED_CHAIN_ID_KEY = 'CHAIN_ID'
const SUBGRAPH_HTTP_ENDPOINT = 'SUBGRAPH_HTTP_ENDPOINT'

// Get a setting from localStorage
function getLocalStorageSetting(confKey) {
  const storageKey = `${confKey}_KEY`
  return window.localStorage.getItem(storageKey)
}

// Get a local setting: from the local storage if available, or the env vars.
function getLocalSetting(confKey) {
  return getLocalStorageSetting(confKey) || env(confKey)
}

function setLocalSetting(confKey, value) {
  const storageKey = `${confKey}_KEY`
  return window.localStorage.setItem(storageKey, value)
}

export function getPreferredChain() {
  return (
    Number(getLocalStorageSetting(PREFERRED_CHAIN_ID_KEY)) || DEFAULT_CHAIN_ID
  )
}

export function setPreferredChain(chainId = 100) {
  return setLocalSetting(PREFERRED_CHAIN_ID_KEY, chainId)
}

export function clearLocalStorageNetworkSettings() {
  window.localStorage.removeItem('DEFAULT_ETH_NODE_KEY')
  window.localStorage.removeItem('IPFS_GATEWAY_KEY')
  window.localStorage.removeItem('SUBGRAPH_HTTP_ENDPOINT_KEY')
}

export function getDefaultEthNode() {
  // Let the network configuration handle node defaults
  return getLocalSetting(DEFAULT_ETH_NODE) || ''
}

export function setDefaultEthNode(node) {
  return setLocalSetting(DEFAULT_ETH_NODE, node)
}

export function getIpfsGateway() {
  return getLocalSetting(IPFS_GATEWAY) || IPFS_ENDPOINT
}

export function setIpfsGateway(gateway) {
  return setLocalSetting(IPFS_GATEWAY, gateway)
}

// The previous package version is stored in localStorage,
// while the current one is coming from the environment.
export function getPackageVersion() {
  return env(PACKAGE_VERSION) || ''
}

export function getLastPackageVersion() {
  return getLocalStorageSetting(PACKAGE_VERSION) || ''
}

export function setPackageVersion(version) {
  return setLocalSetting(PACKAGE_VERSION, version)
}

export function getSubgraphHttpEndpoint() {
  return (
    getLocalSetting(SUBGRAPH_HTTP_ENDPOINT) ||
    'https://api.thegraph.com/subgraphs/name/1hive/celeste'
  )
}

export function setSubgraphHttpEndpoint(endpoint) {
  return setLocalSetting(SUBGRAPH_HTTP_ENDPOINT, endpoint)
}

export function getClientTheme() {
  const storedClientTheme = getLocalStorageSetting(CLIENT_THEME)
  if (storedClientTheme) {
    try {
      return JSON.parse(storedClientTheme)
    } catch (err) {}
  }
  return {
    // To be replaced by an “auto” state
    appearance: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
    theme: null,
  }
}

export function setClientTheme(appearance, theme = null) {
  return setLocalSetting(CLIENT_THEME, JSON.stringify({ appearance, theme }))
}
