import React from 'react'
import { GU, Info, useTheme } from '@1hive/1hive-ui'

import MessageCard from '../MessageCard'
import { useAsset } from '../../hooks/useAsset'
import { ERROR } from '../../utils/asset-utils'

function ErrorLoading({ subject, errors, border }) {
  const theme = useTheme()

  const title = `We couldn't load ${subject} information`
  const paragraph = (
    <div>
      <span>
        Something went wrong! You can restart the app, or you can{' '}
        <span
          css={`
            color: ${theme.help};
          `}
        >
          {' '}
          tell us what went wrong {/* TODO: add link */}
        </span>{' '}
        if the problem persists.
      </span>
      <Info
        mode="error"
        css={`
          margin-top: ${3 * GU}px;
        `}
      >
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </Info>
    </div>
  )

  const errorSvg = useAsset(ERROR)

  return (
    <MessageCard
      title={title}
      paragraph={paragraph}
      icon={errorSvg}
      border={border}
    />
  )
}

export default ErrorLoading
