import CID from 'cids'
import { defaultIpfsGateway } from '../endpoints'
import { toUTF8String } from './web3-utils'

const SPLIT_IPFS_REGEX = /(Qm[a-zA-Z0-9]{44})/
const TEST_IPFS_REGEX = /(Qm[a-zA-Z0-9]{44})/

const REQUEST_TIMEOUT = 60000


export const ipfsGet = async cid => {
  const endpoint = `${defaultIpfsGateway}/${cid}`
  
  try {
    const result = await fetch(endpoint, { timeout: REQUEST_TIMEOUT })
    
    return { result, endpoint, error: !result.ok }
  } catch (err) {
    console.error(`Error requesting data from IPFS for ${endpoint}`, err)
    return { error: true }
  }
}

export const getIpfsCidFromUri = string => {
  const cidString = string.replace(/^ipfs:/, '');
  // if cidString can be passed to CID class without throwing
  // it means it's the actual cid
  try {
    // eslint-disable-next-line no-new
    new CID(cidString);
    return cidString;
  } catch (err) {}

  // if cidString is ipfs v1 version hex from the cid's raw bytes and
  // we add `f` as a multibase prefix and remove `0x`
  try {
    const cid = `f${cidString.substring(2)}`;
    // eslint-disable-next-line no-new
    new CID(cid);
    return cid;
  } catch (err) {}

  // if cidString is ipfs v0 version hex from the cid's raw bytes,
  // we add:
  // 1. 112 (0x70 in hex) which is dag-pb format.
  // 2. 01 because we want to use v1 version
  // 3. f since cidString is already hex, we only add `f` without converting anything.
  try {
    const cid = `f0170${cidString.substring(2)}`;
    // eslint-disable-next-line no-new
    new CID(cid);
    return cid;
  } catch (err) {}

  // if cidString is hex received from string-to-hex converter
  try {
    const cid = toUTF8String(cidString) || cidString;
    // eslint-disable-next-line no-new
    new CID(cid);
    return cid;
  } catch (err) {}

  return ''
}

export function transformIPFSHash(str, callback) {
  return str
    .split(SPLIT_IPFS_REGEX)
    .map((part, index) => callback(part, TEST_IPFS_REGEX.test(part), index))
}
