import { useCallback, useEffect, useRef, useState } from 'react'
import { ipfsGet, getIpfsCidFromUri } from '../lib/ipfs-utils'
import { ERROR_TYPES } from '../types/evidences-status-types'
import { toUTF8 } from '../lib/web3-utils'

const FILE_TYPES = ['application/json', 'application/javascript', 'text/csv', 'text/plain', 'text/html']

export default function useEvidences(dispute, rawEvidences) {
  // Contains valid evidences + errored evidences
  const [evidences, setEvidences] = useState([])
  const [fetchingEvidences, setFetchingEvidences] = useState(true)

  // Contains valid evidences only
  const evidencesCache = useRef(new Map())

  // Fetch an evidence data from IPFS if needed, prepares the evidence object,
  // and cache it if valid. If invalid, returns an errored evidence object.
  const fetchEvidence = useCallback(async rawEvidence => {
    const { id, data: uriOrData, submitter, createdAt } = rawEvidence

    if (evidencesCache.current.has(id)) {
      return evidencesCache.current.get(id)
    }

    const baseEvidence = {
      id,
      rawMetadata: uriOrData,
      metadata: {
        text: null,
        endpoint: null
      },
      submitter,
      createdAt,
      error: false,
    }
    
    const cid = getIpfsCidFromUri(uriOrData)

    // Not an IPFS URI
    if (!cid) {
      evidencesCache.current.set(id, { ...baseEvidence, metadata: { text: toUTF8(uriOrData) } })
      return evidencesCache.current.get(id)
    }

    const { result, endpoint, error } = await ipfsGet(cid)

    if (error) {
      return { ...baseEvidence, error: ERROR_TYPES.ERROR_FETCHING_IPFS }
    }

    const evidenceProcessed = {
      ...baseEvidence,
      metadata: { endpoint }
    }

    const file = await result.clone().blob()
    
    // if the file type is one of the FILE_TYPES, we also show the evidence text on the dashboard
    // otherwise, we put an endpoint link to see the image on gateway link.
    if(FILE_TYPES.includes(file.type)) {
      evidenceProcessed.metadata.text = await result.text()
    }

    evidencesCache.current.set(id, evidenceProcessed)

    return evidenceProcessed
  }, [])

  useEffect(() => {
    let cancelled = false

    const updateEvidences = async () => {
      await Promise.all(
        rawEvidences.map(async rawEvidence => {
          const evidence = await fetchEvidence(rawEvidence)
          if (cancelled) {
            return
          }
          setEvidences(() => {
            // already there
            if (
              evidences.findIndex(_evidence => _evidence.id === evidence.id) >
              -1
            ) {
              return evidences
            }

            return [...evidences, evidence].sort(
              (evidenceA, evidenceB) =>
                evidenceA.createdAt - evidenceB.createdAt
            )
          })
        })
      )
      setFetchingEvidences(false)
    }

    updateEvidences()

    return () => {
      cancelled = true
    }
  }, [dispute.disputable, evidences, fetchEvidence, rawEvidences])

  return [evidences, fetchingEvidences]
}
