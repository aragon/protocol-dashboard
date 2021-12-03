import React, { useCallback, useEffect } from 'react'
import {
  createClient,
  Provider as UrqlProvider,
  cacheExchange,
  debugExchange,
} from 'urql'
import { devtoolsExchange } from '@urql/devtools'
import { getFetchExchange } from '../graphql-exchanges'
import { getSubgraphHttpEndpoint } from '../local-settings'

const SubgraphContext = React.createContext({ resetSubgraphClient: null })

function SubGraphProvider({ children }) {
  const defaultSubgraphHttpEndpoint = getSubgraphHttpEndpoint()
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

export { SubGraphProvider, useSubgraph }
