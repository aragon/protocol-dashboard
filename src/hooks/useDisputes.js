import { useEffect, useMemo, useState } from 'react'
import resolvePathname from 'resolve-pathname'
import { useCourtClock } from '../providers/CourtClock'
import { useCourtConfig } from '../providers/CourtConfig'
import {
  useSingleDisputeSubscription,
  useDisputesSubscription,
} from './subscription-hooks'
import { getPhaseAndTransition } from '../utils/dispute-utils'
import { ipfsGet, getIpfsCidFromUri } from '../lib/ipfs-utils'
import { convertToString, Status } from '../types/dispute-status-types'
import { defaultIpfsEndpoint } from '../endpoints'

const IPFS_ERROR_MSG = 'Error loading content from ipfs'

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

  const processedDispute = useProcessedDispute(dispute)
  const disputePhase = getPhaseAndTransition(
    dispute,
    currentTermId,
    courtConfig
  )
  const disputePhaseKey = disputePhase
    ? convertToString(Object.values(disputePhase)[0])
    : ''

  const graphErrorMessage = graphError?.message || ''
  const disputeErrorMessage = processedDispute?.error || graphErrorMessage

  return useMemo(
    () => {
      const fetching = graphFetching || (dispute && !processedDispute)

      return [
        dispute && processedDispute
          ? {
              ...processedDispute,
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
      graphFetching,
      processedDispute,
    ]
    /* eslint-enable react-hooks/exhaustive-deps */
  )
}

function useProcessedDispute(dispute) {
  const [processedDispute, setProcessedDispute] = useState(null)

  useEffect(() => {
    let cancelled = false

    const processDisputeData = async () => {
      if (dispute.status === Status.Voided) {
        return dispute
      }

      const disputeData = await getDisputeData(dispute)

      return {
        ...dispute,
        ...disputeData,
        error: disputeData ? null : IPFS_ERROR_MSG,
      }
    }

    const processDispute = async () => {
      if (!dispute) {
        return
      }

      const processedDispute = await processDisputeData()
      if (!cancelled) {
        setProcessedDispute(processedDispute)
      }
    }

    processDispute()

    return () => {
      cancelled = true
    }
  }, [dispute])

  return processedDispute
}

async function getDisputeData(dispute) {
  // Dispute is disputable
  if (dispute.disputable) {
    return processDisputableData(dispute)
  }

  // Dispute is raw dispute
  return processRawDisputeData(dispute)
}

async function processDisputableData(dispute) {
  const {
    agreement,
    defendant,
    plaintiff,
    organization,
    title,
  } = dispute.disputable

  const agreementIpfsCid = getIpfsCidFromUri(agreement)

  return {
    agreementText: title,
    agreementUrl: `${defaultIpfsEndpoint()}/${agreementIpfsCid}`,
    defendant,
    description: title,
    organization,
    plaintiff,
  }
}

/**
 * Processes metadata for raw disputes. `metadataUri` contains the IPFS CID which will be fetched and parsed.
 * @param {*} dispute Dispute from which data will be processed.
 * @returns {Object | null} Dispute processed data.
 */
async function processRawDisputeData(dispute) {
  const { description: disputeDescription, metadataUri } = dispute

  if (metadataUri) {
    const ipfsPath = getIpfsCidFromUri(metadataUri)

    if (ipfsPath) {
      // Fetch IPFS content
      const { data, error } = await ipfsGet(ipfsPath)
      if (!error) {
        try {
          // Parse IPFS content
          const parsedDisputeData = JSON.parse(data)
          // parsedDisputeData.agreementText = "";
          // let some = {
          //   agreementText: 'QmfWppqC55Xc7PU48vei2XvVAuH76z2rNFF7JMUhjVM5xV',
          //   description: 'Claim action on Sua et facto',
          //   disputedActionText: 'Challenged Quest claim',
          //   disputedActionURL:
          //     'https://api.thegraph.com/ipfs/api/v0/cat?arg=QmbBVFNLyvuKcxf6Pqny41oMXGJ7JZF8GF9SG7dixzpkja',
          //   agreementTitle: '1Hive Community Covenant',
          //   disputedActionRadspec:
          //     'https://quests.1hive.org/#/detail?id=0x44768B67da9f90c36D18EBa2EEc699e1db3F1D15',
          //   organization: 'Quests',
          //   defendant: '0x91B0d67D3F47A30FBEeB159E67209Ad6cb2cE22E',
          // }

          // parsedDisputeData = { ...parsedDisputeData, ...some }

          console.log('parsedDisputeData', parsedDisputeData)
          const agreementText = parsedDisputeData.agreementText?.replace(
            /^.\//,
            ''
          )
          // Note that in this case, we expect the agreement's location to be relative to the
          // metadata URI. For example, if the metadataUri is `<cid>/metadata.json`, the agreement's
          // location would be `<cid>/<agreement>`
          const agreementUrl = agreementText
            ? resolvePathname(
                agreementText,
                `${defaultIpfsEndpoint()}/${ipfsPath}`
              )
            : ''

          const {
            agreementTitle = '',
            defendant = '',
            description = disputeDescription,
            disputedActionRadspec = '',
            disputedActionText = '',
            disputedActionURL = '',
            organization = '',
            plaintiff = '',
          } = parsedDisputeData

          return {
            agreementText: agreementTitle || agreementText || '',
            agreementUrl,
            defendant,
            description,
            disputedActionRadspec,
            disputedActionText,
            disputedActionURL,
            organization,
            plaintiff,
          }
        } catch (err) {
          console.error(err)
          return {
            description: data,
          }
        }
      }
    }
  }
  return null
}
