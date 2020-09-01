import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ipfsGet, getIpfsCidFromUri } from '../lib/ipfs-utils'
import { ERROR_TYPES } from '../types/evidences-status-types'

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
      metadata: null,
      defendant: '',
      agreementText: '',
      submitter,
      createdAt,
      error: false,
    }

    const cid = getIpfsCidFromUri(uriOrData)

    // Not an IPFS URI
    if (!cid) {
      evidencesCache.current.set(id, { ...baseEvidence, metadata: uriOrData })
      return evidencesCache.current.get(id)
    }

    const { data, error } = await ipfsGet(cid)

    if (error) {
      return { ...baseEvidence, error: ERROR_TYPES.ERROR_FETCHING_IPFS }
    }

    const evidenceProcessed = {
      ...baseEvidence,
      metadata: data,
    }
    evidencesCache.current.set(id, evidenceProcessed)

    return evidenceProcessed
  }, [])

  useEffect(() => {
    let cancelled = false
    setFetchingEvidences(true)

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
  }, [rawEvidences, fetchEvidence, evidences])

  // First evidence submitted by defendant is treated as the dispute description
  const processedEvidences = useMemo(() => {
    if (dispute.disputable) {
      return evidences.filter(
        e => e.rawMetadata !== dispute.disputable.actionContext
      )
    }

    return evidences
  }, [dispute.disputable, evidences])

  return [processedEvidences, fetchingEvidences]
}
