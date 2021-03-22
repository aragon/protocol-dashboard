import {  useMemo } from 'react'
import { useCourtClock } from '../providers/CourtClock'
import { useCourtConfig } from '../providers/CourtConfig'
import {
  useSingleDisputeSubscription,
  useDisputesSubscription,
} from './subscription-hooks'
import { getPhaseAndTransition } from '../utils/dispute-utils'
import { convertToString } from '../types/dispute-status-types'


export default function useDisputes() {
  const courtConfig = useCourtConfig()
  const { currentTermId } = useCourtClock()
  const { disputes, fetching, error } = useDisputesSubscription()

  const disputesPhases = useMemo(() => {
    if (!disputes) {
      return null
    }

    return disputes.map(d =>
      getPhaseAndTransition(d, currentTermId, courtConfig)
    )
  }, [courtConfig, currentTermId, disputes])

  const disputesPhasesKey = disputesPhases
    ? disputesPhases.map(v => convertToString(Object.values(v)[0])).join('')
    : null

  return useMemo(() => {
    if (error) {
      return { error }
    }

    if (fetching) {
      return { fetching }
    }

    return {
      disputes: disputes.map((dispute, i) => {
        return {
          ...dispute,
          ...disputesPhases[i],
        }
      }),
    }
  }, [disputesPhases, disputes, disputesPhasesKey, error]) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook that processes a single dispute data
 * @param {String} disputeId Id of the dispute
 * @returns {Array} Array conformed by the dispute processed data, fetching indicator and an error object from the graph or an ipfs error in that order
 * (the error also indicates if the error is from the graph since we need to handle in a different way
 * in the dispute detail, the timeline can not be displayed if is a graph error but can if the error is from ipfs)
 */
export function useDispute(disputeId) {
  const courtConfig = useCourtConfig()
  const { currentTermId } = useCourtClock()
  const {
    dispute,
    fetching: graphFetching,
    error: graphError,
  } = useSingleDisputeSubscription(disputeId)

  const disputePhase = getPhaseAndTransition(
    dispute,
    currentTermId,
    courtConfig
  )
  const disputePhaseKey = disputePhase
    ? convertToString(Object.values(disputePhase)[0])
    : ''

  const graphErrorMessage = graphError?.message || ''
  const disputeErrorMessage = graphErrorMessage

  return useMemo(
    () => {
      const fetching = graphFetching && !dispute

      return [
        dispute
          ? {
              ...dispute,
              ...disputePhase,
            }
          : null,
        fetching,
        disputeErrorMessage
          ? {
              message: disputeErrorMessage,
              fromGraph: Boolean(graphErrorMessage),
            }
          : null,
      ]
    } /* eslint-disable react-hooks/exhaustive-deps */,
    [
      disputeErrorMessage,
      disputePhaseKey,
      graphErrorMessage,
      graphFetching
    ]
  )
}


