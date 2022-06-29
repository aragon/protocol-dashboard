// rinkeby
const DEFAULT_XDAI_ETH_NODE_ENDPOINT = 'https://rpc.gnosischain.com'
const DEFAULT_POLYGON_ETH_NODE_ENDPOINT = 'https://polygon-rpc.com/'

const ENV_VARS = {
  BUILD() {
    return process.env.REACT_APP_BUILD || 'undefined'
  },
  COURT_SERVER_NAME() {
    return process.env.REACT_APP_COURT_SERVER_NAME
  },
  ETHERSCAN_API_KEY() {
    return process.env.REACT_APP_ETHERSCAN_API_KEY || null
  },
  FORTMATIC_API_KEY() {
    return process.env.REACT_APP_FORTMATIC_API_KEY || ''
  },
  IPFS_GATEWAY() {
    return process.env.REACT_APP_IPFS_GATEWAY || ''
  },
  PACKAGE_VERSION() {
    return process.env.REACT_APP_PACKAGE_VERSION
  },
  POLYGON_ETH_NODE() {
    return (
      process.env.REACT_APP_POLYGON_ETH_NODE ||
      DEFAULT_POLYGON_ETH_NODE_ENDPOINT
    )
  },
  PORTIS_DAPP_ID() {
    return process.env.REACT_APP_PORTIS_DAPP_ID || ''
  },
  SENTRY_DSN() {
    const dsn = process.env.REACT_APP_SENTRY_DSN || ''
    return dsn.trim()
  },
  SKIP_VOIDING() {
    return process.env.REACT_APP_SKIP_VOIDING === '1'
  },
  SUBGRAPH_HTTP_ENDPOINT() {
    return process.env.REACT_APP_SUBGRAPH_HTTP_ENDPOINT || ''
  },
  SUBGRAPH_NAME() {
    return process.env.REACT_APP_SUBGRAPH_NAME
  },
  XDAI_ETH_NODE() {
    return process.env.REACT_APP_XDAI_ETH_NODE || DEFAULT_XDAI_ETH_NODE_ENDPOINT
  },
}

export default function env(name) {
  const envVar = ENV_VARS[name]
  return typeof envVar === 'function' ? envVar() : null
}
