import React, { useCallback, useEffect } from 'react'
import {
  createClient,
  Provider as UrqlProvider,
  cacheExchange,
  debugExchange,
} from 'urql'
import { getFetchExchange } from '../graphql-exchanges'

import { devtoolsExchange } from '@urql/devtools'
import { getNetworkConfig } from '../networks'
import { useWallet } from './Wallet'

const SubgraphContext = React.createContext({ resetSubgraphClient: null })

function SubGraphProvider({ children }) {
  const { preferredNetwork } = useWallet()
  const defaultSubgraphHttpEndpoint = getNetworkConfig().nodes.subgraph
  const newClient = useCallback(
    () =>
      createClient({
        url: defaultSubgraphHttpEndpoint,
        exchanges: [
          debugExchange,
          devtoolsExchange,
          cacheExchange,
          getFetchExchange(),
        ],
      }),
    [defaultSubgraphHttpEndpoint]
  )

  const [client, setClient] = React.useState(newClient())

  useEffect(() => {
    setClient(newClient())
  }, [preferredNetwork, newClient])

  return (
    <SubgraphContext.Provider
      value={{
        resetSubgraphClient: () => setClient(newClient()),
      }}
    >
      <UrqlProvider value={client}>{children}</UrqlProvider>
    </SubgraphContext.Provider>
  )
}

const useSubgraph = () => React.useContext(SubgraphContext)

export { SubGraphProvider, useSubgraph }
