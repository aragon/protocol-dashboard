import React from 'react'
import { IdentityBadge as Badge } from '@1hive/1hive-ui'

import useProfile from '../hooks/useProfileName'
import { getNetworkType } from '../lib/web3-utils'
import { getNetworkConfig } from '../networks'

const networkType = getNetworkType()
const explorer = getNetworkConfig().explorer

const IdentityBadge = React.memo(function IdentityBadge({ entity, ...props }) {
  const profileName = useProfile(entity)

  return (
    <Badge
      label={profileName}
      entity={entity}
      explorerProvider={explorer}
      networkType={networkType === 'xdai' ? 'private' : networkType}
      {...props}
    />
  )
})

export default IdentityBadge
