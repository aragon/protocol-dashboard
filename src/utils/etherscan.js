/* eslint-disable */
import env from '../environment'
const api = env('ETHERSCAN_ENDPOINT')

/**
 * get the contract abi
 * @param {string} to contract address 
 * @returns {Object|null} contract ABI
 */
 export async function getAbi(to) {
  const endpoint = `${api}&module=contract&action=getabi&address=${to}`

  console.log('called getAbi......')
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
