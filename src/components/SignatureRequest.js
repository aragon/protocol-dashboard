import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, GU, textStyle, useTheme } from '@1hive/1hive-ui'
import { useWallet } from '../providers/Wallet'
import { signMessage } from '../lib/web3-utils'
import { dayjs } from '../utils/date-utils'
import TokenLoader from './TokenLoader'
import { SIGNATURE_FAILED, SIGNATURE_SUCCESS } from '../utils/asset-utils'
import { useAsset } from '../hooks/useAsset'

const SignerRequest = React.memo(function SignerRequest({
  compactMode,
  mode,
  onSignSuccess,
  text,
  title,
}) {
  const [signingError, setSigningError] = useState(false)

  const successMode = mode === 'success'

  const wallet = useWallet()

  const theme = useTheme()

  const Illustration = useMemo(() => {
    if (signingError) {
      return SIGNATURE_FAILED
    }
    if (successMode) {
      return SIGNATURE_SUCCESS
    }
    return null
  }, [signingError, successMode])

  const illustrationSvg = useAsset(Illustration)

  const { statusText, statusTextColor } = useMemo(() => {
    if (signingError) {
      return {
        statusText: 'Signature failed',
        statusTextColor: theme.negative,
      }
    }
    if (successMode) {
      return {
        statusText: 'Signature confirmed',
        statusTextColor: theme.positive,
      }
    }
    return {
      statusText: 'Waiting for signature…',
      statusTextColor: theme.surfaceContentSecondary,
    }
  }, [signingError, successMode, theme])

  const infoText = useMemo(() => {
    if (signingError) {
      return 'A error occurred when signing the message.'
    }
    return text
  }, [signingError, text])

  const requestSignature = useCallback(async () => {
    if (!wallet) {
      return
    }
    const now = dayjs.utc().toString()
    const { signHash, error } = await signMessage(wallet, now)

    if (error) {
      setSigningError(true)
      return
    }

    onSignSuccess(signHash, now)
  }, [onSignSuccess, wallet])

  /**  We only need to execute it when the component is rendered but if we need to retry the action we
   should call to the requestSignature callback */
  useEffect(() => {
    if (successMode) {
      return
    }
    requestSignature()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div
        css={`
          display: flex;
          flex-direction: column;
          text-align: center;
          align-items: center;
        `}
      >
        {illustrationSvg ? (
          <img src={illustrationSvg} height={140} width={140} />
        ) : (
          <TokenLoader />
        )}
        <h3
          css={`
            ${textStyle('title2')};
            margin-top: ${4 * GU}px;
          `}
        >
          {title}
        </h3>

        <span
          css={`
            ${textStyle('body2')};
            color: ${statusTextColor};
            margin-top: ${1.5 * GU}px;
          `}
        >
          {statusText}
        </span>
        <span
          css={`
            ${textStyle('body2')};
            color: ${theme.surfaceContentSecondary};
            margin-top: ${1.5 * GU}px;
          `}
        >
          {infoText}
        </span>
        {signingError && (
          <div
            css={`
              display: flex;
              justify-content: space-between;
              width: 100%;
              flex-direction: ${compactMode ? 'column' : 'row'};
              margin-top: ${3 * GU}px;
            `}
          >
            {/* TODO - Update the link once we have a troubleshooting section */}
            <ActionButton
              href="https://1hive.gitbook.io/celeste/"
              compactMode={compactMode}
            >
              Troubleshooting
            </ActionButton>
            <ActionButton
              mode="strong"
              onClick={requestSignature}
              compactMode={compactMode}
            >
              Repeat signature
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  )
})

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

export default SignerRequest
