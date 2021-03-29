import {  defaultAbiCoder } from 'ethers/lib/utils'
import {  getContract } from '../web3-contracts'
import env from '../environment'

const api = env('ETHERSCAN_ENDPOINT')

const GovernDispute = [
    'tuple(' +
        'tuple(' +
        'uint256 nonce, ' +
        'uint256 executionTime, ' +
        'address submitter, ' +
        'address executor, ' +
        'tuple(' +
            'address to, ' +
            'uint256 value, ' +
            'bytes data' +
        ')[] actions, ' +
        'bytes32 allowFailuresMap, ' +
        'bytes proof' +
        '), ' +
        'tuple(' +
        'uint256 executionDelay, ' +
        'tuple(' +
            'address token, ' +
            'uint256 amount' +
        ') scheduleDeposit, ' +
        'tuple(' +
            'address token, ' +
            'uint256 amount' +
        ') challengeDeposit, ' +
        'address resolver, ' +
        'bytes rules, ' +
        ') ' +
    ')'
]

async function _decodeCalldata(to, calldata) {
    const endpoint = `${api}&module=contract&action=getabi&address=${to}`

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    })

    if(response.ok) {
        const json = await response.json()
        if(json.message === 'OK') {
            const abi = JSON.parse(json.result)
            const contract = getContract(to, abi);
            const sigHash = calldata.substring(0,10);
            try {
                const decodedData = contract.interface.decodeFunctionData(sigHash, calldata)
                return Object.fromEntries(Object.entries(decodedData).filter(([key]) => isNaN(key)));
            } catch(err) {
                
            }
        }
    }
    
    return null;
}

async function _decodeGovernQueue(metadata) {
    const data = defaultAbiCoder.decode(GovernDispute, metadata)
    const originalPayload = data[0][0]

    const payload = { 
        executor: originalPayload.executor,
        proof: originalPayload.proof,
        allowFailuresMap: originalPayload.allowFailuresMap,
        actions: []
    }

    const decodedCalldatas = await Promise.all(originalPayload.actions.map(action => _decodeCalldata(action.to, action.data)));

    originalPayload.actions.forEach(async(action, index) => {
        const tempAction = {
            to: action.to,
            value: action.value,
            data: action.data
        }
        
        tempAction.calldata = decodedCalldatas[index] || null
        payload.actions.push(tempAction);     
    })

    return {
        config: data[0][1],
        payload: payload
    }
}

export  async function decodeMetadata(metadata, party = 'Govern') {
    if(party === 'Govern') {
       const data =  await _decodeGovernQueue(metadata);
       return data;
    }
}