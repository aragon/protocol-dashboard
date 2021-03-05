import React from 'react'
import { EthIdenticon, GU, useTheme, textStyle } from '@1hive/1hive-ui'
import useProfileName from '../../hooks/useProfileName'
import { shortenAddress } from '../../lib/web3-utils'
import {
  ACCOUNT_STATUS_JUROR_ACTIVE,
  ACCOUNT_STATUS_JUROR_INACTIVE,
} from '../../types/account-status-types'

import inactiveJurorIcon from '../../assets/IconJurorInactive.svg'
import activeJurorIcon from '../../assets/IconJurorActive.svg'

const getProfileAttributes = (status, theme) => {
  if (status === ACCOUNT_STATUS_JUROR_ACTIVE)
    return {
      background: 'linear-gradient(126deg, #9965AE 19%, #7062B8 188%)',
      primaryColor: theme.accentContent,
      secondaryColor: theme.accentContent,
      statusLabel: 'ACTIVE KEEPER',
      icon: activeJurorIcon,
    }

  if (status === ACCOUNT_STATUS_JUROR_INACTIVE)
    return {
      background: '#F0EEFC',
      primaryColor: theme.content,
      secondaryColor: theme.contentSecondary,
      statusLabel: 'INACTIVE KEEPER',
      icon: inactiveJurorIcon,
    }

  return {
    background: '#F1F1F1',
    primaryColor: theme.content,
    secondaryColor: theme.contentSecondary,
    statusLabel: 'ACCOUNT',
  }
}

function Profile({ account, status }) {
  const theme = useTheme()
  const {
    background,
    primaryColor,
    secondaryColor,
    statusLabel,
    icon,
  } = getProfileAttributes(status, theme)

  const profileName = useProfileName(account)

  return (
    <div
      css={`
        background: ${background};
        padding: ${3 * GU}px;
      `}
    >
      <div
        css={`
          height: ${7 * GU}px;
          display: flex;
          align-items: center;
        `}
      >
        <div
          css={`
            display: flex;
            align-items: stretch;
          `}
        >
          <EthIdenticon
            address={account}
            radius={100}
            scale={2}
            css={`
              margin-right: ${1.5 * GU}px;
            `}
          />
          <div
            css={`
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: ${6 * GU}px;
            `}
          >
            <span
              css={`
                ${textStyle('title4')};
                color: ${primaryColor};
                line-height: 1.2;
              `}
            >
              {profileName || shortenAddress(account)}
            </span>
            <span
              css={`
                ${textStyle('label2')};
                display: flex;
                color: ${secondaryColor};
                line-height: 1.2;
                align-items: center;
              `}
            >
              {icon && (
                <img
                  css={`
                    margin-right: ${0.5 * GU}px;
                  `}
                  src={icon}
                  alt="keeper-icon"
                />
              )}
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
