import env from '../environment'
import {  getContract } from '../web3-contracts'

const api = env('ETHERSCAN_ENDPOINT')

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

// removes all the items that have numeric keys such as `0`, `1`, e.t.c.  
const _removeNumericKeys = (o) =>
  Object.fromEntries(
    Object.entries(o).flatMap(([k, v]) =>
      isNaN(Number(k)) ? [[k, isObj(v) ? _removeNumericKeys(v) : v]] : []
    )
  );


/**
 *
 * @param {string} to contract address 
 * @param {string} calldata encoded calldata
 * @returns {Object|null} decoded calldata
 */
export async function decodeCalldata(to, calldata) {
    const endpoint = `${api}&module=contract&action=getabi&address=${to}`

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
            const abi = JSON.parse(json.result)
            const contract = getContract(to, abi)
            const sigHash = calldata.substring(0,10)
            try {
                const decodedData = contract.interface.decodeFunctionData(sigHash, calldata)
                return _removeNumericKeys(decodedData)
            } catch(err) {
                
            }
        }
    }
    
    return null;
}
