import React, { useRef, useCallback, useContext } from 'react'
import PropTypes from 'prop-types'
import { fetchAbi } from '../utils/etherscan';

const AbiContext = React.createContext()

function AbiProvider({ children }) {
  const cache = useRef({})

  const getAbi = useCallback(async (contractAddress) => {
    try {
      if( cache.current[contractAddress] ) {
        return cache.current[contractAddress];
      }

      const abi = await fetchAbi(contractAddress)
      if( abi )
      {
        cache.current = { [contractAddress]: abi }
      }

      return abi
    } catch (e) {
      return null
    }
  }, [])

  return (
    <AbiContext.Provider value={{getAbi}}>
      {children}
    </AbiContext.Provider>
  )
}

AbiProvider.propTypes = {
  children: PropTypes.node,
}

function useAbi() {
  return useContext(AbiContext)
}

export { AbiProvider, useAbi }
