import React from 'react'
import MessageCard from '../MessageCard'
import { useAsset } from '../../hooks/useAsset'
import { NoDraft } from '../../utils/asset-utils'

function NoMyTasks() {
  const title = 'You have no open tasks right now'
  const paragraph = (
    <span>
      You will receive tasks to complete when you are drafted for a dispute
    </span>
  )

  const noDraftSvg = useAsset(NoDraft)

  return <MessageCard title={title} paragraph={paragraph} icon={noDraftSvg} />
}

export default NoMyTasks
