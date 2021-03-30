import {  defaultAbiCoder } from 'ethers/lib/utils'
import { decodeCalldata } from '../etherscan'

const metadataABI = [
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

export async function decode(metadata) {
    const data = defaultAbiCoder.decode(metadataABI, metadata)
    const originalPayload = data[0][0]

    const payload = { 
        executor: originalPayload.executor,
        proof: originalPayload.proof,
        allowFailuresMap: originalPayload.allowFailuresMap,
        actions: []
    }

    const decodedCalldatas = await Promise.all(originalPayload.actions.map(action => decodeCalldata(action.to, action.data)));

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