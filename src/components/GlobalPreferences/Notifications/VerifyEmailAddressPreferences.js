import React from 'react'
import { Button, GU, textStyle, useTheme, useViewport } from '@1hive/1hive-ui'
import { useAsset } from '../../../hooks/useAsset'
import { EMAIL } from '../../../utils/asset-utils'

const VerifyEmailAddressPreferences = React.memo(
  function VerifyEmailAddressPreferences({
    compactMode,
    email,
    onDeleteEmail,
    onResend,
  }) {
    const theme = useTheme()
    const { below } = useViewport()
    const compact = below('medium')
    const emailSvg = useAsset(EMAIL)

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
          <img src={emailSvg} width={181} height={181} alt="" />
        </div>
        <h3
          css={`
            ${textStyle('title2')};
            margin-top: ${4 * GU}px;
          `}
        >
          Verify your email address
        </h3>
        <span
          css={`
            ${textStyle('body2')};
            color: ${theme.surfaceContentSecondary};
            margin-top: ${1.5 * GU}px;
            padding: 0px ${(compact ? 3 : 20) * GU}px;
          `}
        >
          Almost there! We’ve sent a verification email to{' '}
          <strong>{email}</strong>. Kindly check your inbox and click the link
          to verify your account.
        </span>
        <div
          css={`
            display: flex;
            justify-content: space-between;
            flex-direction: ${compactMode ? 'column' : 'row'};
            width: 100%;
            margin-top: ${3 * GU}px;
          `}
        >
          <ActionButton
            compactMode={compactMode}
            mode="strong"
            onClick={onResend}
          >
            Resend verification email
          </ActionButton>
          <ActionButton compactMode={compactMode} onClick={onDeleteEmail}>
            Reset email
          </ActionButton>
        </div>
      </div>
    )
  }
)

function ActionButton({ compactMode, ...props }) {
  return (
    <Button
      css={`
        width: ${compactMode ? '100%' : `calc((100% - ${2 * GU}px) /  2)`};
      `}
      {...props}
    />
  )
}

export default VerifyEmailAddressPreferences
