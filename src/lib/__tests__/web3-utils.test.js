/* eslint-disable no-undef */
import { getDefaultProvider } from '../web3-utils'
import { getPreferredChain } from '../../local-settings'

describe('Test getDefaultProvider()', () => {
  it('should test getDefaultProvider(null) and return default XDAI url connection', () => {
    const ret = getDefaultProvider(null)
    expect(ret.connection.url).not.toBe('http://localhost:8545')
    expect(ret.connection.url).toBe('https://rpc.gnosischain.com')
  })

  it('should test getDefaultProvider() and return default XDAI url connection', () => {
    const ret = getDefaultProvider(undefined)
    expect(ret.connection.url).toBe('https://rpc.gnosischain.com')
  })

  it('should test getDefaultProvider(4) and return same chainID', () => {
    const ret = getDefaultProvider(4)
    expect(ret._network.chainId).toBe(4)
  })

  it('should test getDefaultProvider(100) and return url connection', () => {
    const ret = getDefaultProvider(100)
    expect(ret.connection.url).toBe('https://rpc.gnosischain.com')
  })
})

describe('Test getPreferredChain()', () => {
  it('should test getPreferredChain() and return 100', () => {
    const chainID = getPreferredChain()
    expect(chainID).toBe(100)
  })
})
