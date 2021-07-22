import {  defaultAbiCoder } from 'ethers/lib/utils'

const metadataABI = [
    'bytes32',
    'bytes' ,
    'string', 
    'bytes32', 
    'string',
    'bytes32',
    'bytes',
];

export async function decode(metadata) {
    const data = defaultAbiCoder.decode(metadataABI, metadata)
    const payload = {
        prefix: data[0],
        agreement: data[1],
        allowActionText: data[2],
        allowActionColor: `#${data[3].substring(2, 8)}`,
        blockActionText: data[4],
        blockActionColor: `#${data[5].substring(2, 8)}`,
        description: data[6]
    }
    return payload;
}
