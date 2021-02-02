import React from 'react'
import { GU } from '@1hive/1hive-ui'
import headerLogoSvg from '../../assets/HeaderLogo.svg'

function HeaderLogo() {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <img
        alt=""
        src={headerLogoSvg}
        width={16 * GU}
        css={`
          margin-right: ${1 * GU}px;
        `}
      />
    </div>
  )
}

export default HeaderLogo
