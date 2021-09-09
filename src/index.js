import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import App from './App'
import initializeSentry from './sentry'
import { checkMigrations } from './migrations'
import { SubGraphProvider } from './providers/Subgraph'
import { APMProvider } from './providers/ElasticAPM'

initializeSentry()
checkMigrations()

const GlobalStyle = createGlobalStyle`
  body img {
    user-select:none;
  }
`

ReactDOM.render(
  <APMProvider>
  <SubGraphProvider>
    <GlobalStyle />
    <App />
  </SubGraphProvider>
  </APMProvider>,
  document.getElementById('root')
)
