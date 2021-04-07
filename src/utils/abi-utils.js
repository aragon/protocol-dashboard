import { BigNumber, utils } from 'ethers';

function decodeValue(value) {
  if(typeof value === 'number' || BigNumber.isBigNumber(value)) return value.toString()
  if(Array.isArray(value)) 
    value = value.map(decodeValue)
  return value
}

/**
 * structures the decoded calldata in a concise way. 
 * 
 * @param {string} name the name of the element
 * @param {object} input abi's component
 * @param {any} value the actual parameter value user called
 * @param {object} accum the final decoded result
 * @returns {void}
 */
function decodeInput(name, input, value, accum) {
  if(!accum[name]) accum[name] = {}

  if(input.arrayChildren) {
    accum[name] = {}; 
    value.map((item, index) => {
      let key = `${index+1}th element`
      if(input.arrayChildren) {
        key += `(${input.arrayChildren.baseType})`
      }
      accum[name][key] = {}
      decodeInput(key, input.arrayChildren, item, accum[name])
    })
    return;
  }

  if(input.type === 'tuple') {
    input.components.forEach((component, index) => {
      decodeInput(`${component.name}(${component.baseType})`, component, value[index], accum[name])
    })
    return;
  }

  accum[name] = decodeValue(value)
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
    
    const functionName = functionABI.name;
    const onlyNamedResult = decodedData.reduce((accum, value, index) => {
      const input = functionABI.inputs[index];

      decodeInput(`Argument #${index + 1} (${input.baseType})`, input, value, accum)

      return accum;
    }, { });

    return { functionName, inputData: onlyNamedResult };
  } catch(err) {
      console.log(err, 'err')
  }
  return null;
}