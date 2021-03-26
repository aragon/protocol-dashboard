import React from 'react'
import MessageCard from '../MessageCard'
import { useAsset } from '../../hooks/useAsset'
import { Comments } from '../../utils/asset-utils'

function NoEvidence() {
  const title = ' The comments are being presented'
  const paragraph =
    'The involved parties have up to 7 days to submit comments supporting their case'
  const commentsAsset = useAsset(Comments)

  return (
    <MessageCard title={title} paragraph={paragraph} icon={commentsAsset} />
  )
}

export default NoEvidence
