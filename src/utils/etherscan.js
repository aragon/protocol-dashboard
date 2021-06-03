import { utils } from 'ethers'
import env from '../environment'
const api = env('ETHERSCAN_ENDPOINT')

/**
 * fetch the contract abi from etherscan
 * @param {string} to contract address 
 * @returns {Object|null} contract ABI
 */
 export async function fetchAbi(to) {
  if (!utils.isAddress(to)) {
     return null
  }

  const endpoint = `${api}&module=contract&action=getabi&address=${to}`

  console.log('hit etherscan......')
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
    })

    if(response.ok) {
      const json = await response.json()
      if(json.message === 'OK') {
          return json.result;
      }
    }

  } catch (e) {
    // swallow error
  }

  return null;
}
