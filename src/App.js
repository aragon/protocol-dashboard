import React from 'react'
import { HashRouter } from 'react-router-dom'
import { Main, ToastHub } from '@1hive/1hive-ui'
import theme from './theme-court'
import AppLoader from './components/AppLoader'
import GlobalErrorHandler from './GlobalErrorHandler'
import MainView from './components/MainView'
import OnboardingLoader from './components/OnboardingLoader'
import EmailNotificationsLoader from './components/EmailNotificationsLoader'
import RequestPanel from './components/RequestPanel/RequestPanel'
import Routes from './Routes'
import { ActivityProvider } from './providers/ActivityProvider'
import { CourtClockProvider } from './providers/CourtClock'
import { CourtConfigProvider } from './providers/CourtConfig'
import { RequestQueueProvider } from './providers/RequestQueue'
import { WalletProvider } from './providers/Wallet'
import { SubGraphProvider } from './providers/Subgraph'
import { useClientTheme } from './providers/ClientTheme'

function App() {
  const { appearance } = useClientTheme()
  return (
    <WalletProvider>
      <SubGraphProvider>
        <HashRouter>
          <ActivityProvider>
            <Main
              assetsUrl="./aragon-ui/"
              layout={false}
              scrollView={false}
              theme={theme[appearance]}
            >
              <GlobalErrorHandler>
                <ToastHub threshold={1} timeout={1500}>
                  <CourtConfigProvider>
                    <CourtClockProvider>
                      <RequestQueueProvider>
                        <MainView>
                          <OnboardingLoader>
                            <EmailNotificationsLoader />
                            <AppLoader>
                              <Routes />
                            </AppLoader>
                          </OnboardingLoader>
                          <RequestPanel />
                        </MainView>
                      </RequestQueueProvider>
                    </CourtClockProvider>
                  </CourtConfigProvider>
                </ToastHub>
              </GlobalErrorHandler>
            </Main>
          </ActivityProvider>
        </HashRouter>
      </SubGraphProvider>
    </WalletProvider>
  )
}

export default App
