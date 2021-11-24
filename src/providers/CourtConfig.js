import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useCourtConfigSubscription } from '../hooks/subscription-hooks'
import { getNetworkConfig } from '../networks'

const CourtConfigContext = React.createContext()

function CourtConfigProvider({ children }) {
  const courtAddress = getNetworkConfig().court
  console.log('court address ', courtAddress)
  const courtConfig = useCourtConfigSubscription(courtAddress)
  console.log('COURT CONFIG!!!!!! ', courtConfig)

  return (
    <CourtConfigContext.Provider value={courtConfig}>
      {children}
    </CourtConfigContext.Provider>
  )
}

CourtConfigProvider.propTypes = {
  children: PropTypes.node,
}

function useCourtConfig() {
  return useContext(CourtConfigContext)
}

export { CourtConfigProvider, useCourtConfig }
