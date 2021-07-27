import {  defaultAbiCoder } from 'ethers/lib/utils'

const metadataABI = [
    'bytes32',
    'bytes',
    'address',
    'string', 
    'bytes32', 
    'string',
    'bytes32',
    'bytes',
];

const evidenceABI = [
    'bytes',
    'string'
];

export function decodeMetadata(metadata) {
    const data = defaultAbiCoder.decode(metadataABI, metadata)
    return {
        prefix: data[0],
        agreement: data[1],
        disputeCreator: data[2],
        buttons: {
            inFavorText: data[3],
            inFavorColor: `#${data[4].substring(2, 8)}`,
            againstText: data[5],
            againstColor: `#${data[6].substring(2, 8)}`,
        },
        description: data[7]
    }
}

export function decodeEvidence(evidence) {
    const data = defaultAbiCoder.decode(evidenceABI, evidence)
    return {
        metadata: data[0],
        label: data[1],
    }
}
