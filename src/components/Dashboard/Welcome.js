import React from 'react'
import { Button, GU, textStyle } from '@1hive/1hive-ui'
import BuyHNY from '../BuyHNY'
import { useAsset } from '../../hooks/useAsset'
import { HOME_BANNER } from '../../utils/asset-utils'

function Welcome() {
  const banner = useAsset(HOME_BANNER)

  return (
    <div
      css={`
        background: url(${banner});
        background-size: cover;
        margin-bottom: ${2 * GU}px;
        border-radius: ${0.5 * GU}px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        flex-wrap: wrap;
        height: 280px;
      `}
    >
      <div
        css={`
          padding: ${4 * GU}px;
          max-width: 600px;
          color: white;
        `}
      >
        <h1
          css={`
            ${textStyle('title1')};
            font-weight: 200;
            margin-bottom: ${1 * GU}px;
          `}
        >
          Welcome to Celeste
        </h1>
        <p
          css={`
            ${textStyle('body1')}
            margin-bottom: ${3 * GU}px;
          `}
        >
          Celeste is a protocol that produces answers to disputes by
          incentivizing keepers to respond coherently.
        </p>
        <div
          css={`
            display: flex;
            align-items: center;
          `}
        >
          <BuyHNY
            css={`
              width: ${19 * GU}px;
              margin-right: ${1.5 * GU}px;
            `}
          />
          <Button
            label="User guide"
            href="https://help.aragon.org/article/41-aragon-court"
            css={`
              width: ${19 * GU}px;
            `}
          />
        </div>
      </div>
    </div>
  )
}

export default Welcome
