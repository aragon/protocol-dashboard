/* eslint-disable */
import { useCallback, useEffect, useRef, useState } from 'react'
import {  getIpfsCidFromUri, fetchIPFS } from '../lib/ipfs-utils'
import { ERROR_TYPES } from '../types/evidences-status-types'
import { toUTF8String } from '../lib/web3-utils'
import { decodeEvidence } from '../utils/dispute-metadata';

// const FILE_TYPES = ['application/json', 'application/javascript', 'text/csv', 'text/plain', 'text/html']

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
        endpoint: null,
        metadata: null // JSON that contains more info...
      },
      submitter,
      createdAt,
      error: false,
    }

    const { label, metadata } = decodeEvidence(uriOrData);
    const cid = getIpfsCidFromUri(metadata)

    // Not an IPFS URI
    if (!cid) {
      evidencesCache.current.set(id, { 
        ...baseEvidence, 
        metadata: { 
          text: toUTF8String(metadata) 
        },
        label, 
      })
      return evidencesCache.current.get(id)
    }

    const data = await fetchIPFS(cid)

    if (data.error) {
      return { ...baseEvidence, label, error: ERROR_TYPES.ERROR_FETCHING_IPFS }
    }

    const evidenceProcessed = {
      ...baseEvidence,
      label,
      metadata: { 
        ...data
      }
    }

    evidencesCache.current.set(id, evidenceProcessed)

    return evidenceProcessed
  }, [])

  useEffect(() => {
    let cancelled = false

    const updateEvidences = async () => {
      let all = await Promise.all(
        rawEvidences.map(async rawEvidence => {
          const evidence = await fetchEvidence(rawEvidence)
          return evidence
        })
      )

      all.sort(
        (evidenceA, evidenceB) =>
          evidenceA.createdAt - evidenceB.createdAt
      )
      
      setEvidences(all)      
      setFetchingEvidences(false)
    }

    updateEvidences()

    return () => {
      cancelled = true
    }
  }, [dispute.disputable, fetchEvidence, rawEvidences])

  return [evidences, fetchingEvidences]
}
