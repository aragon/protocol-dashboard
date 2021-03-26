import React from 'react'
import { GU, LoadingRing, textStyle } from '@1hive/1hive-ui'
import { useAsset } from '../../../hooks/useAsset'
import { EMAIL_NOTIFICATIONS } from '../../../utils/asset-utils'

const LoadingPreferences = React.memo(function LoadingPreferences() {
  const emailNotificationsSvg = useAsset(EMAIL_NOTIFICATIONS)
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
      `}
    >
      <div>
        <img src={emailNotificationsSvg} width={181} height={181} alt="" />
      </div>
      <div
        css={`
          ${textStyle('title2')};
          margin-top: ${4 * GU}px;
          display: flex;
          align-items: center;
        `}
      >
        <LoadingRing />
        <span
          css={`
            margin-left: ${1.5 * GU}px;
          `}
        >
          Loading…
        </span>
      </div>
    </div>
  )
})

export default LoadingPreferences
