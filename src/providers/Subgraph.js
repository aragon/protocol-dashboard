import React, { useCallback, useEffect } from 'react'
import {
  createClient,
  Provider as UrqlProvider,
  cacheExchange,
  debugExchange,
} from 'urql'
import { useSubgraphEndpoint } from '../hooks/useEndpoints'
import { devtoolsExchange } from '@urql/devtools'
import { getFetchExchange } from '../graphql-exchanges'

const SubgraphContext = React.createContext({ resetSubgraphClient: null })

function SubgraphProvider({ children }) {
  const defaultSubgraphHttpEndpoint = useSubgraphEndpoint()
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
  }, [newClient])

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

export { SubgraphProvider, useSubgraph }
