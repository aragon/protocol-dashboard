import React from 'react'
import { GU } from '@1hive/1hive-ui'
import { useAsset } from '../../hooks/useAsset'
import { LOGO } from '../../utils/asset-utils'

function HeaderLogo() {
  const logo = useAsset(LOGO)

  return (
    <div
      css={`
        margin-right: ${1 * GU}px;
        display: flex;
      `}
    >
      <img alt="" src={logo} />
    </div>
  )
}

export default HeaderLogo
