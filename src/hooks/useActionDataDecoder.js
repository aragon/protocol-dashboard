import useAbi from './useAbi';
import { decodeCalldata } from '../utils/abi-utils';

/**
 * Decode the calldata using abi retrieved from etherscan
 * @param {string} to contract address 
 * @param {string} calldata encoded calldata
 * @returns {Object|null} decoded calldata
 */
export default function useActionDataDecoder(to, calldata) {

  const abi = useAbi(to);
  const decodedData = abi? decodeCalldata(abi, calldata) : null;
  return decodedData;

}
  