import ethers from 'ethers'
import { soliditySha3 } from '../lib/web3-utils'
export const BRIGHT_ID_CONTEXT = '1hive'
export const BRIGHT_ID_CONTEXT_BYTES =
  '0x3168697665000000000000000000000000000000000000000000000000000000' // stringToBytes32("1hive")

export const NO_CONTENT = 204
export const NOT_SPONSORED_CODE = 403
export const NOT_FOUND_CODE = 404
export const ERROR_CODE = 500

export const CONTEXT_NOT_FOUND = 1
export const CONTEXTID_NOT_FOUND = 2
export const CAN_NOT_BE_VERIFIED = 3
export const NOT_SPONSORED = 4

// TODO: Remove
const VERIFICATIONS_PRIVATE_KEY =
  '0xd49743deccbccc5dc7baa8e69e5be03298da8688a15dd202e20f15d5e0e9a9fb'
export const getVerificationsSignature = (timestamp, contextIds) => {
  const hashedMessage = soliditySha3(
    ['bytes32', 'address[]', 'uint256'],
    [BRIGHT_ID_CONTEXT_BYTES, contextIds, timestamp]
  )
  const signingKey = new ethers.utils.SigningKey(VERIFICATIONS_PRIVATE_KEY)
  return signingKey.signDigest(hashedMessage)
}
