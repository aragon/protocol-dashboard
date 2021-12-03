import { useMemo } from 'react'
import { Contract as EthersContract } from 'ethers'
import { useWallet } from './providers/Wallet'
import { getDefaultProvider } from './lib/web3-utils'
import { getPreferredChain } from './local-settings'

export function useContract(address, abi, signer = true) {
  const { account, ethers } = useWallet()

  return useMemo(() => {
    // Apparently .getSigner() returns a new object every time, so we use the
    // connected account as memo dependency.

    if (!address || !ethers || !account) {
      return null
    }

    return getContract(address, abi, signer ? ethers.getSigner() : ethers)
  }, [abi, account, address, ethers, signer])
}

export function useContractReadOnly(address, abi) {
  const { chainId, connected } = useWallet()
  return useMemo(() => {
    if (!address) {
      return null
    }
    return getContract(
      address,
      abi,
      getDefaultProvider(connected ? chainId : null)
    )
  }, [abi, address, chainId, connected])
}

export function getContract(
  address,
  abi,
  provider = getDefaultProvider(getPreferredChain())
) {
  return new EthersContract(address, abi, provider)
}
