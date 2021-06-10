import React, { useContext, useMemo } from 'react'
import PropTypes from 'prop-types'

import useNow from '../hooks/useNow'
import { useCourtConfig } from './CourtConfig'
import { getTermPeriod, getExpectedCurrentTermId } from '../utils/court-utils'

const CourtClockContext = React.createContext()

function CourtClockProvider({ children }) {
  const now = useNow()
  const courtConfig = useCourtConfig()

  const { currentTerm: actualCurrentTerm, terms = [], termDuration = 0 } =
    courtConfig || {}

  let expectedCurrentTerm = 0
  let [termStartTime, termEndTime] = [0, 0]
  let firstTermStartTimeFuture = null

  if (terms.length > 0) {
    expectedCurrentTerm = getExpectedCurrentTermId(now, {
      terms,
      termDuration,
    })

    const termPeriod = getTermPeriod(expectedCurrentTerm, {
      terms,
      termDuration,
    })

    termStartTime = termPeriod[0]
    termEndTime = termPeriod[1]
  }
  
  // If the FIRST start time is in the future, 
  // figure out when it is
  if(terms.length === 1 && terms[0].startTime > Date.now()) {
    firstTermStartTimeFuture = new Date(terms[0].startTime)
  }

  const courtClock = useMemo(
    () => ({
      currentTermId: expectedCurrentTerm,
      currentTermStartDate: new Date(termStartTime),
      currentTermEndDate: new Date(termEndTime),
      firstTermStartTimeFuture: firstTermStartTimeFuture,
      isSynced: expectedCurrentTerm === actualCurrentTerm,
      neededTransitions: expectedCurrentTerm - actualCurrentTerm,
    }),
    [actualCurrentTerm, expectedCurrentTerm, termEndTime, termStartTime, firstTermStartTimeFuture]
  )

  return (
    <CourtClockContext.Provider value={courtClock}>
      {children}
    </CourtClockContext.Provider>
  )
}

CourtClockProvider.propTypes = {
  children: PropTypes.node,
}

function useCourtClock() {
  return useContext(CourtClockContext)
}

export { CourtClockProvider, useCourtClock }
