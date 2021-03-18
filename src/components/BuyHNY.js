import React from 'react'
import { Button, GU, useLayout } from '@1hive/1hive-ui'
import HNYIcon from '../assets/IconHNY.svg'

function BuyHNY({ ...props }) {
  const { layoutName } = useLayout()
  const compactMode = layoutName === 'small'
  return (
    <Button
      icon={
        <div
          css={`
            display: flex;
            height: ${GU * 3}px;
            width: ${GU * 3}px;
            margin-right: ${compactMode ? 0 : -6}px;
          `}
        >
          <img
            src={HNYIcon}
            css={`
              margin: auto;
            `}
            height="16"
            width="16"
          />
        </div>
      }
      label="Buy HNY"
      mode="strong"
      display={compactMode ? 'icon' : 'label'}
      href="https://app.honeyswap.org/#/swap?outputCurrency=0x71850b7e9ee3f13ab46d67167341e4bdc905eef9"
      target="_blank"
      {...props}
    />
  )
}

export default BuyHNY
