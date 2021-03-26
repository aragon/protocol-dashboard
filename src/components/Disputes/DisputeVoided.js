import React from 'react'
import { Button, GU, textStyle, useTheme } from '@1hive/1hive-ui'
import { useAsset } from '../../hooks/useAsset'
import { ERROR } from '../../utils/asset-utils'

function DisputeVoided({ id, description, link }) {
  const theme = useTheme()
  const errorSvg = useAsset(ERROR)

  return (
    <div
      css={`
        padding: 0px ${11 * GU}px;
        margin-bottom: ${4 * GU}px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      `}
    >
      <div
        css={`
          display: grid;
          grid-row-gap: ${3 * GU}px;
        `}
      >
        <h1
          css={`
            ${textStyle('title1')}
            font-weight: normal;
          `}
        >
          Void Notice for Dispute #{id}
        </h1>
        <span
          css={`
            color: ${theme.contentSecondary};
            ${textStyle('body1')}
          `}
        >
          {description}
        </span>
        <Button
          label="Read more"
          href={link}
          mode="strong"
          css={`
            width: ${22 * GU}px;
          `}
        />
      </div>
      <img src={errorSvg} alt="" height={40 * GU} />
    </div>
  )
}

export default DisputeVoided
