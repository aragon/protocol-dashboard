import React from 'react'
import {
  createClient,
  Provider as UrqlProvider,
  cacheExchange,
  debugExchange,
} from 'urql'
import { getFetchExchange } from '../graphql-exchanges'

import { devtoolsExchange } from '@urql/devtools'
import { getNetworkConfig } from '../networks'

const SubgraphContext = React.createContext({ resetSubgraphClient: null })
const defaultSubgraphHttpEndpoint = getNetworkConfig().nodes.subgraph

const newClient = () =>
  createClient({
    url: defaultSubgraphHttpEndpoint,
    exchanges: [
      debugExchange,
      devtoolsExchange,
      cacheExchange,
      getFetchExchange(),
    ],
  })

function SubGraphProvider({ children }) {
  const [client, setClient] = React.useState(newClient())

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
