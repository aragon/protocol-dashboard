import ethers from 'ethers'
import { soliditySha3 } from '../lib/web3-utils'
const BRIGHT_ID_CONTEXT =
  '0x3168697665000000000000000000000000000000000000000000000000000000' // stringToBytes32("1hive")
const VERIFICATIONS_PRIVATE_KEY =
  '0xd49743deccbccc5dc7baa8e69e5be03298da8688a15dd202e20f15d5e0e9a9fb'

export const getVerificationsSignature = (timestamp, contextIds) => {
  const hashedMessage = soliditySha3(
    ['bytes32', 'address[]', 'uint256'],
    [BRIGHT_ID_CONTEXT, contextIds, timestamp]
  )
  const signingKey = new ethers.utils.SigningKey(VERIFICATIONS_PRIVATE_KEY)
  return signingKey.signDigest(hashedMessage)
}
