import { useEffect, useState } from 'react'
import { captureException } from '@sentry/browser'

import { bigNum, formatUnits, parseUnits } from '../lib/math-utils'
import { getNetworkType } from '../lib/web3-utils'

const API_BASE = 'https://api.0x.org'

const SELL_TOKEN = 'USDC'
const SELL_TOKEN_DECIMALS = 6

/**
 * Convert a token into a USD price
 *
 * @param {Object} token The token to convert from.
 * @param {BigNumber} amount The amount to convert into USD.
 * @returns { Number } The balance value in USD
 */
export function useTokenAmountToUsd(token, amount) {
  const [amountInUsd, setAmountInUsd] = useState('-')
  useEffect(() => {
    let cancelled = false

    if (getNetworkType() !== 'main') {
      return
    }

    const fetchPrice = async () => {
      try {
        /* use a constant minBuyAmount:
         *  1) to avoid 0x api throwing insufficient liquidity when amount is too small
         *  2) to avoid leaking amount information to 0x server
         *  3) to mitigate getting different prices based on different amounts
        */
        const minBuyAmount = parseUnits("1", token.decimals)
        const url = `${API_BASE}/swap/v1/price?buyAmount=${minBuyAmount}&buyToken=${token.address}&sellToken=${SELL_TOKEN}`
        const res = await fetch(url)

        const { sellAmount } = (await res.json())
        if (cancelled || !sellAmount) {
          return
        }

        const convertedAmount = formatUnits(bigNum(amount || 0).mul(sellAmount).div(minBuyAmount), {
          digits: SELL_TOKEN_DECIMALS,
        })
        setAmountInUsd(convertedAmount)
      } catch (err) {
        console.error(`Could not fetch ${token.symbol} USD price`, err)
        captureException(err)
      }
    }

    fetchPrice()

    return () => {
      cancelled = true
    }
  }, [amount, token])

  return amountInUsd
}
