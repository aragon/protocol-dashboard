import { decodeCalldata } from '../utils/abi-utils'
import { useAbi } from '../providers/AbiProvider'
import { useState, useEffect } from 'react'

/**
 * Decode the calldata using abi retrieved from etherscan
 * @param {string} to contract address 
 * @param {string} calldata encoded calldata
 * @returns {Object|null} decoded calldata
 */
export default function useActionDataDecoder(to, calldata) {
  const [decoding, setDecoding] = useState(true)
  const [decodedData, setDecodedData] = useState(null)
  const { getAbi } = useAbi()

  useEffect(() => {
    let isCancelled = false;

    async function fetchAbi() {
      const abi = await getAbi(to)
      const result = abi ? decodeCalldata(abi, calldata) : null
      if (!isCancelled) {
        setDecodedData(result)
        setDecoding(false)
      }
    }

    fetchAbi()

    return () => {
      isCancelled = true;
    };
  }, [to, calldata, getAbi])

  return { decoding, decodedData };

}

