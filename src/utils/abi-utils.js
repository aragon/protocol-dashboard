import { BigNumber, utils } from 'ethers';
  
/**
 * Recursively format value to string
 * @param {any} value value to be formatted to string
 * @return {any} the formatted result
 */
function toStringRecurse(value) {
  if( value instanceof BigNumber ) return value.toString();

  if( Array.isArray(value) ) {
    return value.map(toStringRecurse);
  }

  return value;
}
  
  
  /**
   *
   * @param {string} abi contract abi 
   * @param {string} calldata encoded calldata
   * @returns {Object|null} decoded calldata
   */
  export function decodeCalldata(abi, calldata) {
    const iface = new utils.Interface(abi)
    const sigHash = calldata.substring(0,10)
    try {
        const decodedData = iface.decodeFunctionData(sigHash, calldata)
        const functionABI = iface.getFunction(sigHash)
        
        // recursively format the value as string
        const result = functionABI.inputs.map((input, index) => {
          const value = toStringRecurse(decodedData[index]);
          
          return { name: input.name || `Arg # ${index + 1}`, value };
        });
        
        console.log(decodedData, ' decoded data')
        console.log(result, 'decoded string data')
        return result
    } catch(err) {
        
    }
    
    return null;
}
  