import React from 'react'
import MessageCard from '../MessageCard'
import { useAsset } from '../../hooks/useAsset'
import { NO_DATA } from '../../utils/asset-utils'

function NoTasks() {
  const title = 'No tasks yet!'
  const noDataSvg = useAsset(NO_DATA)
  return <MessageCard title={title} icon={noDataSvg} />
}

export default NoTasks
