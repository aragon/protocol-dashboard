/* eslint-disable */
import env from '../environment'
import {  getContract } from '../web3-contracts'
import { utils } from 'ethers'
const api = env('ETHERSCAN_ENDPOINT')


function decodeHex(data) {
  try {
    return utils.toUtf8String(data)
  }catch(err) {
    return data;
  }
}

function decodeValue(value) {
  if(typeof value === 'number' || value._isBigNumber) return value.toString()
  
  if(Array.isArray(value)) {
    value = value.map(item => {
      if(typeof item === 'number' || item._isBigNumber) return item.toString()
      // check if value is hex and can be converted to string
      return decodeHex(item)
    })
  }

  // check if value is hex and can be converted to string
  return decodeHex(value)
}

/**
 * 
 * @param {Object} input 
 * @param {any} value 
 * @param {Object} accum 
 */
function decodeInput(input, value, accum) {
  if(input.type === 'tuple') {
    accum[input.name] = {};
    input.components.forEach((component, index) => {
      if(component.type === 'tuple') {
        accum[input.name][component.name] = {};
        decodeInput(component, value[index], accum[input.name])
      }
      else{
        accum[input.name][component.name] = decodeValue(value[index])
      }
    })
  }else{
    accum[input.name] = decodeValue(value)
  }
}

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
                const functionABI = contract.interface.getFunction(sigHash)
                
                // Reduce the elements out
                const onlyNamedResult = decodedData.reduce((accum, value, index) => {
                  const input = functionABI.inputs[index];
                  
                  decodeInput(input, value, accum)
                
                  return accum;
                }, { });
                
                console.log(decodedData, ' decoded data')
                console.log(onlyNamedResult, 'only named result')
                return onlyNamedResult
            } catch(err) {
                
            }
        }
    }
    
    return null;
}
