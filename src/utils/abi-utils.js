import { BigNumber, utils } from 'ethers';

function decodeValue(value) {
  if(typeof value === 'number' || BigNumber.isBigNumber(value)) return value.toString()

  if(Array.isArray(value)) {
    value = value.map(item => {
      if(typeof item === 'number' || BigNumber.isBigNumber(item)) return item.toString()

      return item
    })
  }

  return value
}

function decodeInput(input, value, accum) {
  if(input.type === 'tuple') {
    accum[input.name] = {};
    input.components.forEach((component, index) => {
      if(component.type === 'tuple') {
        accum[input.name][component.name] = {};
        decodeInput(component, value[index], accum[input.name])
      }
      else{
        accum[input.name][component.name] = decodeValue(value[index])
      }
    })
  }else{
    accum[input.name] = decodeValue(value)
  }
}
  
  /**
   *
   * @param {string} abi contract abi 
   * @param {string} calldata encoded calldata
   * @returns {Object|null} decoded calldata
   */
  export function decodeCalldata(abi, calldata) {
    try {
      const iface = new utils.Interface(abi)
      const sigHash = calldata.substring(0,10)
      const decodedData = iface.decodeFunctionData(sigHash, calldata)
      const functionABI = iface.getFunction(sigHash)
        
      const onlyNamedResult = decodedData.reduce((accum, value, index) => {
        const input = functionABI.inputs[index];

        decodeInput(input, value, accum)

        return accum;
      }, { });

      console.log(decodedData, ' decoded data')
      console.log(onlyNamedResult, 'only named result')
      return onlyNamedResult;

    } catch(err) {
        
    }
    
    return null;
}
  