import { decodeCalldata } from '../utils/abi-utils'
import { useAbi } from '../providers/AbiProvider'
import { useState, useEffect } from 'react'
import { utils } from 'ethers'

/**
 * Decode the calldata using abi retrieved from etherscan
 * @param {string} to contract address 
 * @param {string} calldata encoded calldata
 * @returns {Object|null} decoded calldata
 */
export default function useActionDataDecoder(to, calldata) {
  const [decoding, setDecoding] = useState(false)
  const [decodedData, setDecodedData] = useState(null)
  const { getAbi } = useAbi()

  useEffect(() => {
    // invalid address, quick return
    if( !utils.isAddress(to) ) return;

    setDecoding(true)
    async function fetchAbi() {
      const abi = await getAbi(to)
      const result = abi? decodeCalldata(abi, calldata) : null
      setDecodedData(result)
      setDecoding(false)
    }

    fetchAbi()

  }, [to, calldata, getAbi])

  return { decoding, decodedData };

}
  