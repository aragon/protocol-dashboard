import {  defaultAbiCoder } from 'ethers/lib/utils'

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
        ') payload, ' +
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
        ') config' +
    ')'
]



export function decodeMetadata(metadata) {
    const data = defaultAbiCoder.decode(metadataABI, metadata)

    const originalPayload = data[0].payload

    const payload = { 
        executor: originalPayload.executor,
        proof: originalPayload.proof,
        allowFailuresMap: originalPayload.allowFailuresMap,
        actions: originalPayload.actions,
        submitter: originalPayload.submitter
    }

    return {
        config: data[0].config,
        payload: payload
    }
}

export function decodeEvidence(evidence) {
    return {
        label: null,
        metadata: evidence
    };
}
