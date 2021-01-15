import React from 'react'
import { SyncIndicator } from '@1hive/1hive-ui'
import { useCourtConfig } from '../providers/CourtConfig'

function AppLoader({ children }) {
  const courtConfig = useCourtConfig()

  if (!courtConfig) {
    return <SyncIndicator visible label="Loading celeste" /> // TODO: Add better loader
  }

  return <React.Fragment>{children}</React.Fragment>
}

export default AppLoader
