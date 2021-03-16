import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import App from './App'
import { ClientThemeProvider } from './providers/ClientTheme'
import { SubGraphProvider } from './providers/Subgraph'
import initializeSentry from './sentry'
import { checkMigrations } from './migrations'

initializeSentry()
checkMigrations()

const GlobalStyle = createGlobalStyle`
  body img {
    user-select:none;
  }
`

ReactDOM.render(
  <SubGraphProvider>
    <GlobalStyle />
    <ClientThemeProvider>
      <App />
    </ClientThemeProvider>
  </SubGraphProvider>,
  document.getElementById('root')
)
