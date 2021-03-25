import React from 'react'
import { GU } from '@1hive/1hive-ui'
import useIcon from '../../hooks/useIcon'
import { Logo } from '../../utils/icons'

function HeaderLogo() {
  const logo = useIcon(Logo)

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
