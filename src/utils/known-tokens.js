import { getInternalNetworkName } from '../networks'

export const KNOWN_TOKEN_BY_ENV = {
  ANT: {
    main: {
      address: '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
      decimals: 18,
      symbol: 'ANT',
    },
    rinkeby: {
      address: '0x8cf8196c14A654dc8Aceb3cbb3dDdfd16C2b652D',
      decimals: 18,
      symbol: 'ANT',
    },
    ropsten: {
      address: '0x0cb95D9537c8Fb0C947eD48FDafc66A7b72EfC86',
      decimals: 18,
      symbol: 'ANT',
    },
  },
  DAI: {
    main: {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      symbol: 'DAI',
    },
    rinkeby: {
      address: '0xe9A083D88Eed757B1d633321Ce0519F432c6284d',
      decimals: 18,
      symbol: 'DAI',
    },
    ropsten: {
      address: '0x4E1F48Db14D7E1ada090c42ffE15FF3024EEc8Bf',
      decimals: 18,
      symbol: 'DAI',
    },
    local: {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      symbol: 'DAI',
    },
  },
}

export function getKnownToken(symbol) {
  return KNOWN_TOKEN_BY_ENV[symbol][getInternalNetworkName()]
}

export function getANTToken() {
  return KNOWN_TOKEN_BY_ENV.ANT[getInternalNetworkName()]
}
