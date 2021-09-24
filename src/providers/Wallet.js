import React, { useContext, useMemo, useEffect } from 'react'
import { providers as EthersProviders } from 'ethers'
import { UseWalletProvider, useWallet } from 'use-wallet'
import { getUseWalletConnectors } from '../lib/web3-utils'
import env from '../environment'
import { identifyUser } from '../services/analytics';
import { useAPM, updateAPMContext } from './ElasticAPM'

const WalletAugmentedContext = React.createContext()

function useWalletAugmented() {
  return useContext(WalletAugmentedContext)
}

// Adds Ethers.js to the useWallet() object
function WalletAugmented({ children }) {
  const wallet = useWallet()
  const { ethereum } = wallet


useEffect(() => {
  if (
    wallet.status === 'connected' &&
    typeof wallet.account === 'string' &&
    wallet.connector &&
    wallet.networkName
  ) {
    identifyUser(wallet.account, wallet.networkName, wallet.connector);
  }
}, [wallet.networkName, wallet.connector, wallet.status, wallet.account]);

  const ethers = useMemo(
    () => (ethereum ? new EthersProviders.Web3Provider(ethereum) : null),
    [ethereum]
  )

  const contextValue = useMemo(() => ({ ...wallet, ethers }), [wallet, ethers])

  const {apm} = useAPM()
  useEffect(() => {
    updateAPMContext(apm, contextValue.networkName);
  }, [apm, contextValue.networkName]);

  return (
    <WalletAugmentedContext.Provider value={contextValue}>
      {children}
    </WalletAugmentedContext.Provider>
  )
}

function WalletProvider({ children }) {
  return (
    <UseWalletProvider
      chainId={env('CHAIN_ID')}
      connectors={getUseWalletConnectors()}
    >
      <WalletAugmented>{children}</WalletAugmented>
    </UseWalletProvider>
  )
}

export { useWalletAugmented as useWallet, WalletProvider }
