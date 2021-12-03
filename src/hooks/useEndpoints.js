import {
  getDefaultEthNode,
  getPreferredChain,
  getSubgraphHttpEndpoint,
} from '../local-settings'
import { useWallet } from '../providers/Wallet'

export function useEthNodeEndpoint() {
  const { chainId, connected } = useWallet()
  return getDefaultEthNode(connected ? chainId : getPreferredChain())
}
export function useSubgraphEndpoint() {
  const { chainId, connected } = useWallet()
  return getSubgraphHttpEndpoint(connected ? chainId : getPreferredChain())
}
