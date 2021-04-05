import { useState, useEffect } from 'react';
import { getAbi } from '../utils/etherscan';


/**
 * Retrieve abi from etherscan
 * @param {string} to contract address 
 * @returns {String|null} abi
 */
export default function useAbi(to) {
  const [abi, setAbi] = useState({});
    
  useEffect(() => {
    const fetchAbi = async (to) => {
      if( !abi[to] ) {
        const result = await getAbi(to);
        setAbi(currentAbi => {
          const newAbi = { [to]: result };
          return {...currentAbi, ...newAbi};
        });
      }
    }

    fetchAbi(to);
  }, [to, abi])
  
  return abi[to];
}