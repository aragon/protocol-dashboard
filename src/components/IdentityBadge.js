import React from 'react'
import { IdentityBadge as Badge } from '@1hive/1hive-ui'

import useProfile from '../hooks/useProfileName'
import { getNetworkConfig } from '../networks'

const IdentityBadge = React.memo(function IdentityBadge({ entity, ...props }) {
  const profileName = useProfile(entity)
  const { explorer, type } = getNetworkConfig()

  return (
    <Badge
      label={profileName}
      entity={entity}
      explorerProvider={explorer}
      networkType={type}
      {...props}
    />
  )
})

export default IdentityBadge
