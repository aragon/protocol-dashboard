import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import App from './App'
import { ClientThemeProvider } from './providers/ClientTheme'

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
  <>
    <GlobalStyle />
    <ClientThemeProvider>
      <App />
    </ClientThemeProvider>
  </>,
  document.getElementById('root')
)
